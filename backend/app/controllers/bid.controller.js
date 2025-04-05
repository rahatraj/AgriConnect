import { validationResult } from "express-validator"
import CustomError from "../utils/CustomError.js"
import Product from "../models/product.model.js"
import Bid from "../models/bid.model.js"
import Wallet from "../models/wallet.model.js"
import mongoose from "mongoose"
import Notification from "../models/notification.model.js"
import { io } from "../config/socket.js"
import { logTransaction } from "../utils/walletService.js"
import User from "../models/user.model.js"
import { Transaction } from "../models/transaction.model.js"


const bidCltr = {}

bidCltr.startBidding = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }

    try {
        const  productId  = req.params.id;
        const { basePrice, biddingDeadLine, quantity } = req.body;
        const farmerId = req.currentUser.userId;
        const role = req.currentUser.role

        if(!farmerId && role !== "Farmer"){
            throw new CustomError("Unauthorized access. Only farmer can start a bid.", 403)
        }

        if(new Date() > new Date(biddingDeadLine)){
            throw new CustomError("Bid Deadline must be greater than today.")
        }

        const product = await Product.findOne({_id : productId, farmer : farmerId})
        if(!product){
            throw new CustomError("Product not found or not owned by the farmer.", 404)
        }

        if(product.status !== "Available"){
            throw new CustomError("Bidding only can be started for available products", 400)
        }

        const newBid = new Bid({
            product : productId,
            basePrice,
            currentHighestBid : basePrice,
            biddingDeadLine : new Date(biddingDeadLine),
            bidStatus : "Open",
            quantity
        })

        // save the bid
        const savedBid = await newBid.save()

        // Update the product status and associate it with the bid
        product.status = "Bidding",
        product.bids.push(savedBid._id)
        await product.save()

        // Populate the bid with necessary information
        const populatedBid = await Bid.findById(savedBid._id)
            .populate('product')
            .populate('farmer', 'fullName email')
            .lean();

        // Emit new bid event
        io.emit("startBidding", populatedBid);

        // system notification 
        const systemNotification = new Notification({
            message : `Bidding has started for the product "${product.productName}". Check it out now!`,
            notificationType : "System"
        })
        await systemNotification.save()

        io.emit("notification", {
            message : systemNotification.message,
            notificationType : systemNotification.notificationType,
            timestamp : new Date()
        })

        return res.status(201).json({
            success : true,
            message : "Bidding has been started successfully.",
            bid : populatedBid
        });

    } catch (error) {
        next(error)
    }
}

bidCltr.placeBid = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }
    // start session 
    const session = await mongoose.startSession()
    session.startTransaction()

    try {
        const bidAmount = Number(req.body.bidAmount)
        const productId = req.body.productId
        const buyerId = req.currentUser.userId;

        if(!bidAmount || bidAmount < 0){
            console.log("Bid Amount .", bidAmount)
            throw new CustomError("Invlaid bid amount", 400)
        }

        const product = await Product.findById(productId)
            .populate("bids")
            .populate("farmer")
            .session(session);

        if(!product){
            throw new CustomError("Product not found!", 404)
        }

        // for farmer notification 
        const farmerId = product.farmer._id.toString()

        console.log("farmer Id : ", farmerId)

        const bid = await Bid.findOne({ product : productId, bidStatus : "Open"}).session(session)
        if(!bid){
            throw new CustomError("Bidding is not active for this project.", 404)
        }

        if(Number(bidAmount) < bid.currentHighestBid){
            throw new CustomError(`Bid amount must be greater than current highest bid (${bid.currentHighestBid})`, 400)
        }

        // buyer name for bid notification
        const buyerName = await User.findOne({_id : buyerId})

        // fetch buyer's wallet
        const buyerWallet = await Wallet.findOne({user : buyerId}).session(session)
        if(!buyerWallet || Number(buyerWallet.balance) < Number(bidAmount)){
            throw new CustomError("Insufficient balance in your wallet(buyer).", 400)
        }

        //deduct amount from buyer's wallet
        await logTransaction({
            walletId : buyerWallet._id,
            amount : bidAmount,
            transactionType : "Bid Deduction",
            referenceId : productId,
            referenceType : "Product",
            direction : "debit",
            session
        })


        // credit to the admin wallet 
        const adminWallet = await Wallet.findOne({user : process.env.ADMIN_ID}).session(session)
        if(!adminWallet){
            throw new CustomError("Admin wallet not found!", 404)
        }

        await logTransaction({
            walletId: adminWallet._id,
            transactionType: "Bid Received",
            amount: bidAmount,
            referenceId: productId,
            referenceType: "Product",
            direction: "credit",
            session,
        });

        // refund previous highest bidder
        const previousHighestBid = bid.bidders[bid.bidders.length - 1];
        if (previousHighestBid) {

            const previousWallet = await Wallet.findOne({ user: previousHighestBid.buyer}).session(session);

            if (previousWallet) {
                
                // deduct from admin wallet
                await logTransaction({
                    walletId : adminWallet._id,
                    transactionType: "Bid Refund",
                    amount: previousHighestBid.bidAmount,
                    referenceId: productId,
                    referenceType: "Product",
                    direction : "debit",
                    session
                });

                // credit to the previous buyer 
                await logTransaction({
                    walletId : previousWallet._id,
                    transactionType: "Bid Refund",
                    amount: previousHighestBid.bidAmount,
                    referenceId: productId,
                    referenceType: "Product",
                    direction : "credit",
                    session
                });

                // Notify previous bidder
                const previousNotification = new Notification({
                    user: previousHighestBid.buyer,
                    message: `You have been outbid on the product "${product.productName}".`,
                    notificationType: "Bidding",
                });

                await previousNotification.save({ session });

                io.to(previousHighestBid.buyer.toString()).emit("notification", {
                    message: previousNotification.message,
                    notificationType: previousNotification.notificationType,
                    timestamp: new Date(),
                });
            }
        }

        // update bid details
        bid.bidders.push({
            buyer : buyerId,
            bidAmount,
            bidTime : Date.now()
        });

        bid.currentHighestBid = bidAmount;
        await bid.save({session});

        const updatedBid = await Bid.findById(bid._id).populate("bidders.buyer").session(session);

        // Create and join the room when the first bid is placed
        const roomSize = io.sockets.adapter.rooms.get(bid._id)?.size || 0;
        if (roomSize === 0) {
            console.log(` Creating bid room: ${bid._id}`);
            io.emit("joinRoom", bid._id);  // Notify buyers to join
        }

        // Emit event to the room for real time updatas
        io.to(bid._id.toString()).emit("bidUpdate", {
            bidId : updatedBid._id,
            currentHighestBid : updatedBid.currentHighestBid,
            bidders : updatedBid.bidders
        })

        console.log("Emitted bidUpdate event for product:", productId);
        // notify the new bidder 
        const newNotification = new Notification({
            user : buyerId,
            message : `Your bid of ${bidAmount} on "${product.productName}" was placed successfully.`,
            notificationType : "Bidding"
        })
        await newNotification.save({session})

        io.to(buyerId.toString()).emit("notification", {
            message : newNotification.message,
            notificationType : newNotification.notificationType,
            timestamp : new Date(),
        })

        // Notify the farmer about the new bid
        const farmerNotification = new Notification({
            user: farmerId,
            message: `A new bid of ₹${bidAmount} has been placed on your product "${product.productName}".`,
            notificationType: "Bidding"
        });
        await farmerNotification.save({ session });

        // Emit the notification event to the farmer
        io.to(farmerId).emit("notification", {
            message: farmerNotification.message,
            notificationType: farmerNotification.notificationType,
            timestamp: new Date(),
        });

        const bidNotification = new Notification({
            message: `New bid placed: ₹${bidAmount} by ${buyerName?.fullName}`,
            notificationType : "Bidding"
        })
        await bidNotification.save({session})

        io.to(bid._id.toString()).emit("notification", {
            message: bidNotification.message,
            notificationType : bidNotification.notificationType,
            bidId: bid._id,
            timestamp : new Date()
        });
        
        console.log("Emitted notification event for user:", buyerId);
        // commit session
        await session.commitTransaction()
        await session.endSession();

        return res.status(200).json({
            succcess : true,
            message : "Bid palced successfully",
            updatedBid : {
                currentHighestBid : updatedBid.currentHighestBid,
                bidders : updatedBid.bidders
            }
        })

    } catch (error) {
        await session.abortTransaction();
        await session.endSession();
        next(error)

    }
}

bidCltr.closeBid = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new CustomError("Validation failed.", 400, errors.array()));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const bidId = req.params.id;
        const userId = req.currentUser.userId;
        const role = req.currentUser.role;

        const bid = await Bid.findById(bidId)
            .populate("product")
            .populate("bidders.buyer") // Get full buyer details
            .session(session);

        if (!bid) throw new CustomError("Bid not found!", 404);
        if (bid.bidStatus !== "Open") throw new CustomError("This Bid is already closed.", 400);

        const product = bid.product;
        const isManualClose = role === "Farmer" && product.farmer.toString() === userId;
        const isDeadlinePassed = new Date() >= new Date(bid.biddingDeadLine);

        if (!isManualClose && !isDeadlinePassed) {
            throw new CustomError("Bidding deadline not passed yet, and you are not authorized to close this bid.", 403);
        }

        const highestBidder = bid.bidders.length > 0 ? bid.bidders[bid.bidders.length - 1] : null;

        if (!highestBidder) {
            // **Case: No bids placed**  
            bid.bidStatus = "Close";
            await bid.save({ session });

            product.status = "Available"; // Product remains unsold
            await product.save({ session });

            // Notify farmer
            const farmerNotification = new Notification({
                user: product.farmer,
                message: `The bid for "${product.productName}" has been closed. No bids were placed.`,
                notificationType: "Bidding",
            });
            await farmerNotification.save({ session });

            io.to(product.farmer.toString()).emit("notification", {
                message: farmerNotification.message,
                notificationType: farmerNotification.notificationType,
                timestamp: new Date(),
            });

            await session.commitTransaction();
            session.endSession();

            return res.status(200).json({
                success: true,
                message: "Bidding closed. No bids were placed on the product.",
            });
        }

        // **Handle Winner & Payout**
        const adminWallet = await Wallet.findOne({ user: process.env.ADMIN_ID }).session(session);
        if (!adminWallet || adminWallet.balance < highestBidder.bidAmount) {
            throw new CustomError("Admin wallet has insufficient funds for payout. Contact support.", 400);
        }

        // Deduct from admin wallet
        await logTransaction({
            walletId: adminWallet._id,
            transactionType: "Payout",
            amount: highestBidder.bidAmount,
            referenceId: product._id,
            referenceType: "Product",
            direction: "debit",
            session,
        });

        // Credit to farmer wallet
        const farmerWallet = await Wallet.findOne({ user: product.farmer }).session(session);
        if (!farmerWallet) throw new CustomError("Farmer's wallet not found.", 400);

        await logTransaction({
            walletId: farmerWallet._id,
            transactionType: "Bid Received",
            amount: highestBidder.bidAmount,
            referenceId: product._id,
            referenceType: "Product",
            direction: "credit",
            session,
        });

        // **Update bid & product status**
        product.status = "Sold";
        await product.save({ session });

        bid.bidStatus = "Close";
        bid.winner = highestBidder.buyer;
        await bid.save({ session });

        // **Notify All Bidders**
        const notifications = [];

        for (const bidder of bid.bidders) {
            notifications.push({
                user: bidder.buyer,
                message: `The bidding for "${product.productName}" has been closed. Thank you for participating.`,
                notificationType: "Bidding",
            });

            io.to(bidder.buyer.toString()).emit("notification", {
                message: `The bidding for "${product.productName}" has been closed.`,
                notificationType: "Bidding",
                timestamp: new Date(),
            });
        }

        await Notification.insertMany(notifications, { session });

        // **Notify Farmer & Winner**
        const farmerNotification = new Notification({
            user: product.farmer,
            message: `Your Product "${product.productName}" has been sold for ₹${highestBidder.bidAmount}.`,
            notificationType: "Bidding",
        });
        await farmerNotification.save({ session });

        io.to(product.farmer.toString()).emit("notification", {
            message: farmerNotification.message,
            notificationType: farmerNotification.notificationType,
            timestamp: new Date(),
        });

        const winnerNotification = new Notification({
            user: highestBidder.buyer,
            message: `🎉 Congratulations! You won the bid for "${product.productName}" with a bid of ₹${highestBidder.bidAmount}.`,
            notificationType: "Bidding",
        });
        await winnerNotification.save({ session });

        io.to(highestBidder.buyer.toString()).emit("notification", {
            message: winnerNotification.message,
            notificationType: winnerNotification.notificationType,
            timestamp: new Date(),
        });

        // **Broadcast bid closed message**
        io.to(bid._id.toString()).emit("bidClosed", {
            bidId: bid._id,
            currentHighestBid: bid.currentHighestBid,
            bidders: bid.bidders,
            winner: { name: highestBidder.buyer.fullName, amount: highestBidder.bidAmount },
            message: "Bidding is closed. Please check the results.",
        });

        // **Notify users to leave the bid room**
        io.to(bid._id.toString()).emit("leaveRoom", { bidId: bid._id });

        console.log(`✅ Bid ${bid._id} closed. All users leaving the room.`);

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Bidding closed successfully",
            winner: { name: highestBidder.buyer.fullName, amount: highestBidder.bidAmount },
            productStatus: "Sold",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
bidCltr.viewMyOngoingBids = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new CustomError("Validation failed.", 400, errors.array()));
        }

        const {
            page = 1,
            limit = 10,
            status,
            category,
            search,
            sort = "biddingDeadLine"
        } = req.query;

        const userId = req.currentUser.userId;
        const role = req.currentUser.role;

        if (role !== "Farmer") {
            throw new CustomError("Unauthorized access. Only Farmers can view their ongoing bids.", 403);
        }

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Build Query
        let query = { "product.farmer": userId };

        if (status && status !== "All") {
            query.bidStatus = status;
        }

        if (category) {
            query["product.category"] = category;
        }

        if (search) {
            query["$or"] = [
                { "product.productName": { $regex: search, $options: "i" } },
                { "product.productDescription": { $regex: search, $options: "i" } }
            ];
        }

        // Sorting
        const sortQuery = (sort === "basePrice")
            ? { basePrice: 1 }
            : { biddingDeadLine: 1 };

        // Fetch Bids
        const bids = await Bid.find(query)
            .populate({
                path: "product",
                select: "productName category productDescription productImages"
            })
            .sort(sortQuery)
            .skip(skip)
            .limit(limitNumber);

        const total = await Bid.countDocuments(query);

        if (total === 0) {
            return res.status(200).json({
                success: true,
                message: "No bids found. Please add products to participate in bidding.",
                bids: [],
                pagination: { total: 0, page: pageNumber, limit: limitNumber, totalPages: 0 }
            });
        }

        return res.status(200).json({
            success: true,
            message: "Ongoing bids fetched successfully.",
            bids,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber)
            }
        });

    } catch (error) {
        next(error);
    }
};


bidCltr.viewBidDetails = async(req,res,next)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }
    try {
        const  bidId = req.params.id;
        const bid = await Bid.findById(bidId)
            .populate({
                path: "product",
                select: "productName category farmer productDescription productImages address geoCoordinates",
                populate: {
                    path: "farmer",
                    select: "fullName email"
                }
            })

            .populate({path : "bidders.buyer", select : "fullName email"})
            .populate({path : "winner", select : "fullName"})
        if(!bid){
            throw new CustomError("Bid not found!", 404)
        }

       return res.status(200).json({
        succcess : true,
        message : "Fetched bid details successfully.",
        bid
       }) 
    } catch (error) {
        next(error)
    }
}
bidCltr.getAllBids = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, search, category, sort } = req.query;
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // **Sorting Configuration**
        let sortQuery = { createdAt: -1 }; // Default: Newest first
        if (sort === "asc") {
            sortQuery = { "basePrice": 1 }; // Price Low to High
        } else if (sort === "desc") {
            sortQuery = { "basePrice": -1 }; // Price High to Low
        }

        // **MongoDB Aggregation Pipeline**
        const bids = await Bid.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }, // Flatten the product array
            {
                $lookup: {
                    from: "users",
                    localField: "product.farmer",
                    foreignField: "_id",
                    as: "product.farmer"
                }
            },
            { $unwind: "$product.farmer" }, // Flatten the farmer array
            //  Apply `$match` here, after `$lookup`
            {
                $match: {
                    ...(status ? { bidStatus: status } : {}),
                    ...(category ? { "product.category": category } : {}),
                    ...(search
                        ? {
                              $or: [
                                  { "product.productName": { $regex: search, $options: "i" } },
                                  { "product.productDescription": { $regex: search, $options: "i" } }
                              ]
                          }
                        : {})
                }
            },
            { $sort: sortQuery }, // Sorting applied properly
            { $skip: skip }, // Pagination - Skip records
            { $limit: limitNumber }, //  Limit the records
            {
                $project: {
                    _id: 1,
                    bidStatus: 1,
                    basePrice: 1,
                    currentHighestBid: 1,
                    quantity : 1,
                    biddingDeadLine: 1,
                    createdAt: 1,
                    "product._id": 1,
                    "product.productName": 1,
                    "product.productDescription": 1,
                    "product.category": 1,
                    "product.productImages": 1,
                    "product.basePrice": 1,
                    "product.quantity":1,
                    "product.status": 1,
                    "product.farmer._id": 1,
                    "product.farmer.fullName": 1,
                    "product.farmer.email": 1,
                }
            }
        ]);

        // Get total count **(Must match aggregation query)**
        const totalBids = await Bid.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $match: {
                    ...(status ? { bidStatus: status } : {}),
                    ...(category ? { "product.category": category } : {}),
                    ...(search
                        ? {
                              $or: [
                                  { "product.productName": { $regex: search, $options: "i" } },
                                  { "product.productDescription": { $regex: search, $options: "i" } }
                              ]
                          }
                        : {})
                }
            },
            { $count: "total" } // Count total matching documents
        ]);

        return res.status(200).json({
            success: true,
            bids,
            pagination: {
                total: totalBids.length > 0 ? totalBids[0].total : 0,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil((totalBids.length > 0 ? totalBids[0].total : 0) / limitNumber),
            },
        });
    } catch (error) {
        next(error);
    }
};

bidCltr.getFarmerStats = async (req, res, next) => {
    try {
        const farmerId = req.currentUser.userId;

        const farmerProducts = await Product.find({ farmer: farmerId }).select("_id");
        const farmerProductIds = farmerProducts.map(p => p._id);

        // Count Active & Completed Bids
        const totalActiveBids = await Bid.countDocuments({ bidStatus: "Open", product: { $in: farmerProductIds } });
        const totalCompletedBids = await Bid.countDocuments({ bidStatus: "Close", product: { $in: farmerProductIds } });

        // Total Earnings Calculation
        const totalEarnings = await Transaction.aggregate([
            { 
                $match: { 
                    user: new mongoose.Types.ObjectId(farmerId), 
                    transactionType: "Bid Received" 
                } 
            },
            { 
                $group: { _id: null, total: { $sum: "$amount" } } 
            }
        ]);
        const earningsAmount = totalEarnings.length > 0 ? totalEarnings[0].total : 0;

        // Wallet Balance
        const farmerWallet = await Wallet.findOne({ user: farmerId });
        if (!farmerWallet) throw new CustomError("Wallet not found.", 404);
        const walletBalance = farmerWallet.balance;

        // Recent Bids
        const recentBids = await Bid.aggregate([
            { $match: { product: { $in: farmerProductIds } } },
            { $unwind: "$bidders" },
            { $sort: { "bidders.bidTime": -1 } },
            { $limit: 3 },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $project: {
                    productName: "$product.productName",
                    bidAmount: "$bidders.bidAmount",
                    bidTime: "$bidders.bidTime"
                }
            }
        ]);

        // **Weekly Earnings History**
        const weeklyEarnings = await Transaction.aggregate([
            { 
                $match: { 
                    user: new mongoose.Types.ObjectId(farmerId), 
                    transactionType: "Bid Received" 
                } 
            },
            {
                $group: {
                    _id: { 
                        year: { $year: "$createdAt" },
                        week: { $isoWeek: "$createdAt" } // Group by ISO Week
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } } 
        ]);

        const getStartOfWeek = (year, week) => {
            const firstDayOfYear = new Date(year, 0, 1);
            const daysOffset = (week - 1) * 7 - firstDayOfYear.getDay() + 1;
            const startOfWeek = new Date(year, 0, 1 + daysOffset);
            return startOfWeek.toISOString().split("T")[0]; // Returns YYYY-MM-DD
        };
        
        // Format Weekly Earnings
        const earningsHistory = weeklyEarnings.map(entry => ({
            weekStart: getStartOfWeek(entry._id.year, entry._id.week),
            total: entry.total
        }));
        

        return res.status(200).json({
            success: true,
            totalActiveBids,
            totalCompletedBids,
            totalEarnings: earningsAmount,
            walletBalance,
            recentBids,
            earningsHistory 
        });

    } catch (error) {
        next(error);
    }
};

bidCltr.getBuyerStats = async (req, res, next) => {
    try {
        const buyerId = new mongoose.Types.ObjectId(req.currentUser.userId);

        const bids = await Bid.find({"bidders.buyer" : buyerId}).populate("product")

        if (!bids || bids.length === 0) {
            throw new CustomError("No bids found for this buyer.", 404);
        }

        const totalAvailableBids = await Bid.countDocuments();
        
        const totalActiveBids = bids
            .filter((bid) => bid.bidStatus === "Open" && bid.bidders
            .some(bidder => bidder.buyer.toString() === buyerId.toString())
        ).length;

        const wonBids = bids.filter((bid) => bid.winner?.toString() === buyerId.toString()).length;

        // total lost bids
        const lostBids = totalAvailableBids - (wonBids + totalActiveBids);
        
        const recentBids = bids.flatMap(bid => bid.bidders)
            .filter(bidder => bidder.buyer.toString() === buyerId.toString())
            .sort((a, b) => b.bidTime - a.bidTime)
            .slice(0, 5);

            // category count
        const categoryCount = bids.reduce((acc, bid) => {
            if (bid.product && bid.product.category) {
                acc[bid.product.category] = (acc[bid.product.category] || 0) + 1;
            }
            return acc;
        }, {});

        console.log("categorycount : ", categoryCount)
        const mostFrequentCategory = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1]) 
            .map(([category]) => category)[0] || category[1];

        // Recommended Bids
        let recommendedBids = [];
        if (mostFrequentCategory) {
            recommendedBids = await Bid.aggregate([
                {
                    $match: {
                        bidStatus: "Open",
                        $or: [{ winner: { $exists: false } }, { winner: { $ne: buyerId } }]
                    }
                },
                {
                    $lookup: {
                        from: "products", // Ensure this matches the actual collection name
                        localField: "product",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $unwind: "$product"
                },
                {
                    $match: {
                        "product.category": mostFrequentCategory
                    }
                },
                {
                    $sort: { createdAt: -1 }
                },
                {
                    $limit: 5
                },
                {
                    $project: {
                        _id: 1,
                        productName: "$product.productName",
                        category: "$product.category",
                        basePrice: "$basePrice",
                        biddingDeadLine : "$biddingDeadLine"
                    }
                }
            ]);
        }

    
        console.log("category count : ", categoryCount)
        console.log("most frequent category: ", mostFrequentCategory)
        console.log("recommended bids : ", recommendedBids)
        // Wallet Balance
        const buyerWallet = await Wallet.findOne({ user: buyerId });
        if (!buyerWallet) throw new CustomError("Wallet not found.", 404);
        const walletBalance = buyerWallet.balance;

        return res.status(200).json({
            success : true,
            totalActiveBids,
            wonBids,
            lostBids,
            recentBids,
            recommendedBids,
            walletBalance,
        });
    } catch (error) {
        next(error);
    }
};
bidCltr.biddingHistory = async (req, res, next) => {
    try {
        const userId = req.currentUser.userId;
        const { page = 1, limit = 10, category = "" } = req.query;

        console.log("buyer Id : ", userId)
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        let bidQuery = { "bidders.buyer": userId };

        // Filter based on category
        if (category === "activeBids") {
            bidQuery.bidStatus = "Open";
        } else if (category === "wonBids") {
            bidQuery.bidStatus = "Close";
            bidQuery.winner = userId; // User won the bid
        } else if (category === "lostBids") {
            bidQuery.bidStatus = "Close";
            bidQuery.winner = { $ne: userId }; // User lost the bid
        }

        // Fetch total count for pagination
        const totalBids = await Bid.countDocuments(bidQuery);

        // Fetch paginated results
        const bids = await Bid.find(bidQuery)
            .populate("product")
            .skip(skip)
            .limit(limitNumber)
            .sort({ biddingDeadLine: -1 });

        if(!bids){
            throw new CustomError("No bids found., 404")
        }
        res.status(200).json({
            success: true,
            totalBids,
            totalPages: Math.ceil(totalBids / limitNumber),
            page: pageNumber,
            limit: limitNumber,
            data: bids,
        });
    } catch (error) {
        next(error);
    }
};


export default bidCltr;