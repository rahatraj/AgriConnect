import cron from 'cron'
import mongoose from 'mongoose'
import Bid from '../../models/bid.model.js'
import Wallet from '../../models/wallet.model.js'
import Notification from '../../models/notification.model.js'
import { io } from "../../config/socket.js"
import { logTransaction } from '../../utils/walletService.js'
import CustomError from '../../utils/CustomError.js'
import User from '../../models/user.model.js'

// for every minute

const closeExpiredBidsJob = new cron.CronJob("*/1 * * * *", async()=> {
    console.log('Checking for expired bids.....')

    const now = new Date()
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const expiredBids = await Bid.find({
            bidStatus : "Open",
            biddingDeadLine : { $lt : now}
        }).populate("product")

        if(expiredBids.length === 0){
            console.log("no expired bids found.")
            return;
        }

        for(const bid of expiredBids){
            const session = await mongoose.startSession()
            session.startTransaction();

            try {
                const product = bid.product;
                const highestBidder = bid.bidders[bid.bidders.length - 1]

                if(!highestBidder){
                    // for no were bids placed
                    bid.bidStatus = "Close"
                    product.status = "Available"
                    await bid.save({session})
                    await product.save({session})

                    // Notify the farmer
                    const farmerNotification = new Notification({
                        user: product.farmer,
                        message: `The bid for your product "${product.productName}" has been closed. No bids were placed.`,
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
                    continue;          
                }

                        
                // Fetch wallets
                const adminWallet = await Wallet.findOne({ user: process.env.ADMIN_ID }).session(session);
                const farmerWallet = await Wallet.findOne({ user: product.farmer }).session(session);
                if (!adminWallet || !farmerWallet) {
                    throw new CustomError("Wallets not found!",404);
                  }
          
                // Transfer the bid amount from admin to farmer
                await logTransaction({
                    walletId: adminWallet._id,
                    transactionType: "Payout",
                    amount: Number(highestBidder.bidAmount),
                    referenceId: product._id,
                    referenceType: "Product",
                    direction: "debit",
                    session,
                });
        
                await logTransaction({
                    walletId: farmerWallet._id,
                    transactionType: "Bid Received",
                    amount: Number(highestBidder.bidAmount),
                    referenceId: product._id,
                    referenceType: "Product",
                    direction: "credit",
                    session,
                });

                // Update bid and product status
                bid.bidStatus = "Close";
                bid.winner = highestBidder.buyer;
                product.status = "Sold";
                await bid.save({ session });
                await product.save({ session });

                // Send notifications

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
                    message: `Congratulations! You won the bid for "${product.productName}" with ₹${highestBidder.bidAmount}.`,
                    notificationType: "Bidding",
                });

                await winnerNotification.save({ session });

                io.to(highestBidder.buyer.toString()).emit("notification", {
                    message: winnerNotification.message,
                    notificationType: winnerNotification.notificationType,
                    timestamp: new Date(),
                });

                // Notify all bidders
                for (const bidder of bid.bidders) {
                    const bidderNotification = new Notification({
                        user: bidder.buyer,
                        message: `The bidding for "${product.productName}" has been closed. Thank you for participating.`,
                        notificationType: "Bidding",
                    });

                    await bidderNotification.save({ session });
        
                    io.to(bidder.buyer.toString()).emit("notification", {
                        message: bidderNotification.message,
                        notificationType: bidderNotification.notificationType,
                        timestamp: new Date(),
                    });
                }
                const winnerDetails = await User.findById(highestBidder.buyer).select("fullName");
                if (!winnerDetails) {
                    throw new CustomError("Winner details not found!", 404);
                }
                // Notify the bid room
                io.to(bid._id.toString()).emit("bidClosed", {
                    bidId: bid._id,
                    currentHighestBid: bid.currentHighestBid,
                    bidders: bid.bidders,
                    winner: {name : winnerDetails?.fullName, amount : highestBidder.bidAmount},
                    message: `Bidding closed! Winner: ${winnerDetails?.fullName} with ₹${bid.currentHighestBid}`,
                });
        
                // Make all users leave the bid room
                io.to(bid._id).emit("leaveRoom", { bidId: bid._id });
        
                console.log(` Closed bid ${bid._id} and notified users.`);
        
                await session.commitTransaction();
                session.endSession();
            } catch (error) {
                throw new CustomError("Internal server error", 500)
                await session.abortTransaction()
                await session.endSession()
            }
        }

    } catch (error) {
        await session.abortTransaction()
        await session.endSession()
    }
})

// Export the function to start the job
export function startBidClosingCron() {
    closeExpiredBidsJob.start();
    console.log(" Cron job started: Checking for expired bids every minute.");
}