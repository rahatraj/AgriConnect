import { validationResult } from "express-validator"
import CustomError from "../utils/CustomError.js"
import Storage from "../models/storage.model.js"
import Wallet from "../models/wallet.model.js"
import StorageTransaction from "../models/storageTransaction.model.js"
import Notification from "../models/notification.model.js"
import { io } from "../config/socket.js"
import { logTransaction } from "../utils/walletService.js"
import mongoose from "mongoose"

const storageTransactionCltr = {}

storageTransactionCltr.createBooking = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new CustomError("Validation Failed.", 400, errors.array()));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { quantity, productId, startDate, endDate, bookingFee } = req.body;
        const { storageId } = req.params;
        const userId = req.currentUser.userId;
        const role = req.currentUser.role;
        
        // Validate dates
        if (new Date(startDate) < new Date()) {
            throw new CustomError("Start date must be in the future.", 400);
        }
        if (new Date(endDate) <= new Date(startDate)) {
            throw new CustomError("End date must be greater than Start date.", 400);
        }

        // Fetch the storage
        const storage = await Storage.findById(storageId).session(session);
        if (!storage) {
            throw new CustomError("Storage facility not found!", 404);
        }

        // Check storage capacity
        if (storage.capacity < quantity) {
            throw new CustomError("Insufficient storage capacity.", 400);
        }

        // Calculate total cost and validate booking fee
        const totalCost = Number(quantity) * Number(storage.pricePerKg);
        
        if (isNaN(Number(bookingFee)) || Number(bookingFee) <= 0 || Number(bookingFee) > totalCost) {
            throw new CustomError("Invalid booking fee amount.", 400);
        }
        
        const remainingCost = totalCost - bookingFee;

        // Deduct the booking fee from user's wallet
        const userWallet = await Wallet.findOne({ user: userId }).session(session);
        if (!userWallet || userWallet.balance < bookingFee) {
            throw new CustomError("Insufficient wallet balance.", 400);
        }

        await logTransaction({
            walletId: userWallet._id,
            transactionType: "Storage Payment",
            amount: Number(bookingFee),
            referenceId: storageId,
            referenceType: "Storage",
            direction: "debit",
            session,
        });

        // Credit the booking fee to the admin wallet
        const adminWallet = await Wallet.findOne({ user: process.env.ADMIN_ID}).session(session);
        if (!adminWallet) {
            throw new CustomError("Admin wallet not found!", 404);
        }

        await logTransaction({
            walletId: adminWallet._id,
            transactionType: "Storage Payment",
            amount: Number(bookingFee),
            referenceId: storageId,
            referenceType: "Storage",
            direction: "credit",
            session,
        });

        // Update storage capacity
        storage.capacity -= quantity;
        storage.product = productId;
        await storage.save({ session });

        // Create or update transaction record
        let transaction = await StorageTransaction.findOneAndUpdate(
            { storage: storageId },
            {
                $setOnInsert: { storage: storageId },
                $push: {
                    bookings: {
                        farmer: role === "Farmer" ? userId : undefined,
                        buyer: role === "Buyer" ? userId : undefined,
                        quantity,
                        totalCost,
                        bookingFee,
                        remainingCost,
                        paymentStatus: "Booking Fee Paid",
                        startDate: new Date(startDate),
                        endDate: new Date(endDate),
                        status: "Pending Arrival",
                    },
                },
            },
            { new: true, upsert: true, session }
        );

        // Notify the storage owner about the booking
        const ownerNotification = new Notification({
            user: storage.owner,
            message: `A new booking has been made for your storage "${storage.name}". Booking fee of ${bookingFee} has been paid.`,
            notificationType: "Storage",
        });
        await ownerNotification.save({ session });

        io.to(storage.owner.toString()).emit("notification", {
            message: ownerNotification.message,
            notificationType: ownerNotification.notificationType,
            createdAt: new Date(),
        });

        // Notify the user (farmer/buyer) about the booking confirmation
        const userNotification = new Notification({
            user: userId,
            message: `Your storage booking for "${storage.name}" has been confirmed. You have paid a booking fee of ${bookingFee}.`,
            notificationType: "Storage",
        });
        await userNotification.save({ session });

        io.to(userId.toString()).emit("notification", {
            message: userNotification.message,
            notificationType: userNotification.notificationType,
            createdAt: new Date(),
        });

        // Notify the admin about the booking fee
        const adminNotification = new Notification({
            user: process.env.ADMIN_ID,
            message: `A booking fee of ${bookingFee} has been credited to your wallet for storage "${storage.name}".`,
            notificationType: "Storage",
        });
        await adminNotification.save({ session });

        io.to(process.env.ADMIN_ID).emit("notification", {
            message: adminNotification.message,
            notificationType: adminNotification.notificationType,
            createdAt: new Date(),
        });


        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Booking created successfully. Awaiting full payment upon arrival.",
            transaction,
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};


storageTransactionCltr.confirmArrivalAndPay = async(req,res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new CustomError("Validation Failed.", 400, errors.array()));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { storageId, transactionId } = req.params;
        const { remainingCost } = req.body;
        const userId = req.currentUser.userId;

        const storage = await Storage.findById(storageId).session(session)
        if(!storage){
            throw new CustomError("storage not found!", 404)
        }
        // Fetch the transaction
        const transaction = await StorageTransaction.findOne({_id : transactionId ,storage: storageId }).session(session);
        if (!transaction) {
            throw new CustomError("No active booking found for this storage.", 404);
        }

        const booking = transaction.bookings.find(
            (b) => b.farmer.toString() === userId || b.buyer.toString() === userId && b.status === "Pending Arrival"
        );
        if (!booking) {
            throw new CustomError("No pending booking found for this user.", 404);
        }

        // Validate remaining cost
        if (booking.remainingCost !== Number(remainingCost)) {
            throw new CustomError("Invalid remaining cost amount.", 400);
        }

        // Deduct remaining cost from user's wallet
        const userWallet = await Wallet.findOne({ user: userId }).session(session);
        if (!userWallet || userWallet.balance < remainingCost) {
            throw new CustomError("Insufficient wallet balance for remaining cost.", 400);
        }

        await logTransaction({
            walletId: userWallet._id,
            transactionType: "Storage Payment",
            amount: remainingCost,
            referenceId: storageId,
            referenceType: "Storage",
            direction: "debit",
            session,
        });

        // Credit the remaining cost to the admin wallet
        const adminWallet = await Wallet.findOne({ user: process.env.ADMIN_ID}).session(session);
        if (!adminWallet) {
            throw new CustomError("Admin wallet not found!", 404);
        }

        await logTransaction({
            walletId: adminWallet._id,
            transactionType: "Storage Payment",
            amount: remainingCost,
            referenceId: storageId,
            referenceType: "Storage",
            direction: "credit",
            session,
        });

        // Pay the storage owner (total: booking fee + remaining cost)
        const storageOwnerWallet = await Wallet.findOne({ user: storage.owner}).session(session);
        if (!storageOwnerWallet) {
            throw new CustomError("Storage owner's wallet not found!", 404);
        }

        const totalPayment = booking.bookingFee + booking.remainingCost - process.env.PLATEFORM_CHARGE;
        await logTransaction({
            walletId: adminWallet._id,
            transactionType: "Storage Payment",
            amount: totalPayment,
            referenceId: storageId,
            referenceType: "Storage",
            direction: "debit",
            session,
        });

        await logTransaction({
            walletId: storageOwnerWallet._id,
            transactionType: "Storage Payment",
            amount: totalPayment,
            referenceId: storageId,
            referenceType: "Storage",
            direction: "credit",
            session,
        });

        // Update the booking status
        booking.paymentStatus = "Fully Paid";
        booking.status = "Confirmed";
        booking.remainingCost = 0;
        await transaction.save({ session });

        // Notify the storage owner about the full payment
        const ownerNotification = new Notification({
            user: storage.owner,
            message: `The full payment of ${totalPayment} for storage "${storage.name}" has been credited to your wallet.`,
            notificationType: "Storage",
        });
        await ownerNotification.save({ session });

        io.to(storage.owner.toString()).emit("notification", {
            message: ownerNotification.message,
            notificationType: ownerNotification.notificationType,
            createdAt: new Date(),
        });

        // Notify the user about the successful payment and booking confirmation
        const userNotification = new Notification({
            user: userId,
            message: `Your storage booking for "${storage.name}" has been fully paid and confirmed. Total payment: ${totalPayment}.`,
            notificationType: "Storage",
        });
        await userNotification.save({ session });

        io.to(userId.toString()).emit("notification", {
            message: userNotification.message,
            notificationType: userNotification.notificationType,
            createdAt: new Date(),
        });

        // Notify the admin about the payment transfer to the storage owner
        const adminNotification = new Notification({
            user: process.env.ADMIN_ID,
            message: `The full payment of ${totalPayment} for storage "${storage.name}" has been processed and transferred to the storage owner's wallet.`,
            notificationType: "Storage",
        });
        await adminNotification.save({ session });

        io.to(process.env.ADMIN_ID).emit("notification", {
            message: adminNotification.message,
            notificationType: adminNotification.notificationType,
            createdAt: new Date(),
        });

        
        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({
            success: true,
            message: "Payment completed successfully and booking confirmed.",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}
storageTransactionCltr.cancelBooking = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }
    const session = await mongoose.startSession()
    session.startTransaction()
    try {
        const { storageId, transactionId } = req.params;
        const userId = req.currentUser.userId;

        const storage = await Storage.findById(storageId)
        if(!storage){
            throw new CustomError("Storage facilities not found!", 404)
        }

        const transaction = await StorageTransaction.findOne({_id : transactionId, storage : storageId}).session(session)
        if(!transaction){
            throw new CustomError("No booking found for this given Transaction Id", 404)
        }

        // specific booking in transaction schema 
        const bookingIndex = transaction.bookings.findIndex((b)=> b.farmer?.toString() === userId || b.buyer?.toString() === userId && b.status === "Pending Arival");

        if(bookingIndex === -1){
            throw new CustomError("No booking found for this current user.", 404)
        }

        // calculate refund amount
        const booking = transaction.bookings[bookingIndex]
        const refundAmount =(booking.bookingFee * (100 - process.env.STORAGE_CANCELLATION_PERCENTAGE))/100
        const bookingRemaingAmount = booking.bookingFee - refundAmount;

        //check start date of booking 
        if(new Date(booking.startDate) <= new Date()){
            throw new CustomError("Booking cancellation date has expired, can not procceed.",400)
        }

        // admin wallet
        const adminWallet = await Wallet.findOne({user : process.env.ADMIN_ID, walletType : "Admin"}).session(session)
        if(!adminWallet){
            throw new CustomError("admin's wallet not found!", 404)
        } 

        if(adminWallet.balance < refundAmount){
            throw new CustomError("Insufficient balance in admin's wallet.", 404)
        }

        // deduct refund amount from admin wallet
        await logTransaction({
            walletId : adminWallet._id,
            transactionType : "Storage Refund",
            amount : refundAmount,
            referenceId : storageId,
            referenceType : "Storage",
            direction : "debit",
            session
        })

        // user wallet 
        const userWallet = await Wallet.findOne({user : userId}).session(session)
        if(!userWallet){
            throw new CustomError("wallet not found!.", 404)
        }
        
        // credit refund amount to farmer/buyer wallet   
        await logTransaction({
            walletId : userWallet._id,
            transactionType : "Storage Refund",
            amount : refundAmount,
            referenceId : storageId,
            referenceType : "Storage",
            direction : "credit",
            session
        })

        // credit the remaining amount to the storage owner
        const storageOwnerWallet = await Wallet.findOne({user : storage.owner, walletType : "StorageOwner"}).session(session)
        if(!storageOwnerWallet){
            throw CustomError("Owner's wallet not found!", 404)
        }

        await logTransaction({
            walletId : storageOwnerWallet._id,
            transactionType : "Storage Refund",
            amount : bookingRemaingAmount,
            referenceId : storageId,
            referenceType : "Storage",
            direction : "credit",
            session
        })

        // update the transaction schema 
        transaction.bookings[bookingIndex].paymentStatus = "Refunded",
        transaction.bookings[bookingIndex].status = "Cancelled"

        await transaction.save({session})

        // notify owner
        const ownerNotification = new Notification({
            user : storage.owner,
            message : `A refund of ₹${bookingRemaingAmount} has been credited for a canceled booking.`,
            notificationType : "Storage"
        })
        await ownerNotification.save({session})

        io.to(storage.owner.toString()).emit("notification", {
            message : ownerNotification.message,
            notificationType : ownerNotification.notificationType,
            createdAt : Date.now()
        })

        // notify user
        const userNotification = new Notification({
            user : userId,
            message : `Your booking has been canceled. A refund of ₹${refundAmount} has been processed.`,
            notificationType : "Storage"
        })
        await userNotification.save({session})

        io.to(userId.toString()).emit("notification", {
            message : userNotification.message,
            notificationType : userNotification.notificationType,
            createdAt : Date.now()
        })

        // admin notify
        const adminNotification = new Notification({
            user : process.env.ADMIN_ID,
            message : `A refund of ₹${bookingRemaingAmount} has been credited for a canceled booking.`,
            notificationType : "Storage"
        })
        await adminNotification.save({session})

        io.to(process.env.ADMIN_ID.toString()).emit("notification",{
            message : adminNotification.message,
            notificationType : adminNotification.notificationType,
            createdAt : Date.now()
        })

        // commit session
        await session.commitTransaction()
        session.endSession()

        return res.status(200).json({
            success : true,
            message : 'Booking cancelled successfully. Refund processed.'
        })
     } catch (error) {
        // abort the session
        await session.abortTransaction()
        session.endSession()
        next(error)
    }

}
storageTransactionCltr.getAllTransactions = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 404, errors.array()))
    }
    try {
        const { storageId } = req.params;
        if(req.currentUser.role !== "StorageOwner" || req.currentUser.role !== "Admin"){
            throw new Error("Unauthorized access.", 403)
        }
        const transactions = await StorageTransaction.findOne({storage : storageId}).populate("bookings.farmer bookings.buyer")

        if(!transactions || transactions.length === 0){
            throw new CustomError("No transactions found for this storage.", 404)
        }

        return res.status(200).json({
            success : true,
            message : "Successfully fetched the transactions.",
            transactions
        })
    } catch (error) {
        next(error)
    }
}

storageTransactionCltr.getUserTransactions = async(req,res,next) => {
    try {
        const userId = req.currentUser.userId;
        const role = req.currentUser.role;
        
        if(role !== "Farmer" || role !== "Buyer"){
            throw new CustomError("Unauthorized access.", 403)
        }
        const transaction = await StorageTransaction.findOne({
            $or : [
                {"bookings.farmer" : userId},
                {"bookings.buyer" : userId}
            ]
        }).populate("storage")

        if(!transaction){
            throw new CustomError("No transactions found!", 404)
        }
        return res.status(200).json({
            success : true,
            message : "Transactions fetched successfully.",
            transaction
        })
    } catch (error) {
        next(error)
    }
}
export default storageTransactionCltr;