import { validationResult } from "express-validator"
import CustomError from "../utils/CustomError.js"
import Wallet from "../models/wallet.model.js"
import mongoose from "mongoose"
import razorpayInstance from "../config/razorpay.js"
import crypto from 'crypto'
import { logTransaction } from "../utils/walletService.js"
import Notification from '../models/notification.model.js'
import { io } from '../config/socket.js'
import { addFundAccount, createPayout, createRazorpayContact } from "../utils/razorpayServices.js"
import User from '../models/user.model.js'
import { Transaction } from "../models/transaction.model.js"
import Profile from "../models/profile.model.js"

const walletCltr = {}

walletCltr.getWalletDetails = async(req,res,next) => {
    try {
        const userId = req.currentUser.userId;
        const wallet = await Wallet.findOne({ user: userId })
            .select("balance transactions")
            .populate({
                path: "transactions", 
                options: { sort: { transactionDate: -1 }, limit: 5 }
            })
            .lean();
        if(!wallet){
            throw new CustomError("Your wallet not found!", 404)
        }
        return res.status(200).json({
            success : true,
            message : "wallet fetched successfully.",
            wallet
        })
    } catch (error) {
        next(error)
    }
}

walletCltr.addFunds = async(req,res,next) => {
    try {
        const userId = req.currentUser.userId;
        const { amount } = req.body;
        console.log("type of : ",typeof amount)
        console.log("controller amount", amount)
        if(!amount || amount <=0 ){
            throw new CustomError("Invalid amount. Must be greater than 0.", 400)
        }

        // razorpay order
        const order = await razorpayInstance.orders.create({
            amount : amount * 100,
            currency : "INR",
            receipt : `recharge_${userId.slice(-6)}_${Date.now().toString().slice(-6)}`
        })

        if(!order){
            throw new CustomError("Failed to create payment order.", 500)
        }

        return res.status(200).json({
            success : true,
            message : "Order created successfully.",
            order
        })
    } catch (error) {
        console.log(error)
        next(error)
    }
}

walletCltr.verifyPayment = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
            const userId = req.currentUser.userId;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
                throw new CustomError("Missing payment details.", 400);
            }

            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
                .update(`${razorpay_order_id}|${razorpay_payment_id}`)
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                throw new CustomError("Payment verification failed.", 400);
            }

            if (isNaN(amount) || Number(amount) <= 0) {
                throw new CustomError("Invalid payment amount.", 400);
            }

            // Check if transaction already exists (to prevent duplicates)
            const existingTransaction = await Transaction.findOne({ referenceId: razorpay_payment_id }).session(session);
            if (existingTransaction) {
                throw new CustomError("Payment already processed.", 409);
            }

            // Find user wallet
            const wallet = await Wallet.findOne({ user: userId }).session(session);
            if (!wallet) {
                throw new CustomError("Wallet not found!", 404);
            }

            // Log transaction
            await logTransaction({
                walletId: wallet._id,
                transactionType: "Wallet Recharge",
                amount: Number(amount),
                referenceId: razorpay_payment_id,
                referenceType: "Deposit",
                direction: "credit",
                session
            });

            // Create and send notification
            const userNotification = new Notification({
                user: userId,
                message: `Your wallet has been recharged with ₹${amount}.`,
                notificationType: "Wallet"
            });

            await userNotification.save({ session });

            io.to(userId.toString()).emit("notification", {
                message: userNotification.message,
                notificationType: userNotification.notificationType,
                createdAt: Date.now()
            });

            return res.status(200).json({
                success: true,
                message: `Payment verified and wallet recharged successfully.`
            });
        });
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        next(error);
    } finally {
        session.endSession();
    }
};

walletCltr.getTransactionHistory = async(req,res,next) => {
    try {
        const userId = req.currentUser.userId;
        const transaction = await Transaction.find({user : userId})
        if(!transaction){
            throw new CustomError("No transactions found!", 404)
        }

        return res.status(200).json({
            success : true,
            message : "Transaction fetched successfully.",
            transaction
        })
    } catch (error) {
        next(error)
    }
}

walletCltr.transferFunds = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { mobileNo, amount } = req.body;
        const senderId = req.currentUser.userId;

        if (!Number(amount) || Number(amount) <= 0) {
            throw new CustomError("Invalid amount. Must be greater than 0.", 400);
        }

        // receiver's profile using mobile number
        const profile = await Profile.findOne({ contactNumber: mobileNo });
        if (!profile) {
            throw new CustomError("Recipient not found!", 404);
        }
        const receiverId = profile.user;

        if (senderId.toString() === receiverId.toString()) {
            throw new CustomError("Sender and receiver cannot be the same.", 400);
        }

        // sender and receiver wallets
        const senderWallet = await Wallet.findOne({ user: senderId }).session(session);
        const receiverWallet = await Wallet.findOne({ user: receiverId }).session(session);

        if (!senderWallet) {
            throw new CustomError("Sender wallet not found!", 404);
        }
        if (!receiverWallet) {
            throw new CustomError("Recipient wallet not found!", 404);
        }

        // Log transactions (this updates the wallet balance)
        await logTransaction({
            walletId: senderWallet._id,
            transactionType: "Transfer Out",
            amount: Number(amount),
            referenceId: receiverWallet._id,
            referenceType: "Wallet",
            direction: "debit",
            session,
        });

        await logTransaction({
            walletId: receiverWallet._id,
            transactionType: "Transfer In",
            amount: Number(amount),
            referenceId: senderWallet._id,
            referenceType: "Wallet",
            direction: "credit",
            session,
        });

        // Notify sender
        const senderNotification = new Notification({
            user: senderId,
            message: `₹${amount} has been successfully sent to ${mobileNo}.`,
            notificationType: "Wallet",
        });
        await senderNotification.save({ session });

        io.to(senderId.toString()).emit("notification", {
            message: senderNotification.message,
            notificationType: senderNotification.notificationType,
            createdAt: Date.now(),
        });

        // Notify receiver
        const receiverNotification = new Notification({
            user: receiverId, 
            message: `₹${amount} has been received from ${mobileNo}.`,
            notificationType: "Wallet",
        });
        await receiverNotification.save({ session });

        io.to(receiverId.toString()).emit("notification", {
            message: receiverNotification.message,
            notificationType: receiverNotification.notificationType,
            createdAt: Date.now(),
        });

        // Commit session
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: "Transfer successful",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};
// once the razorpay enable the payout section in razorpay dashboard, where i can get my payout account and add my env. file so i can config it in my createPayout functionality which is in razorpayServer.js file. 

// for actual amount  withdrawal from the wallet

// walletCltr.withdrawFunds = async(req,res,next)=> {
//     const session = await mongoose.startSession()
//     session.startTransaction()
    
//     try {
//         const userId = req.curre.userId;
//         const { amount } = req.body;

//         if(!amount || amount <=0 ){
//             throw new CustomError("Invalid amount. Must be greater than 0.", 400)
//         }

//         const wallet = await Wallet.findOne({user : userId}).session(session)
//         if(!wallet){
//             throw new CustomError("Wallet not found!", 404)
//         }

//         await logTransaction({
//             walletId : wallet._id,
//             transactionType : "Withdrawal",
//             amount,
//             referenceId : null,
//             referenceType : "Payout",
//             direction : "debit",
//             session
//         })

//         const user = await User.findById(userId).session(session)
//         // Create Razorpay Contact
//         const contact = await createRazorpayContact(user);

//         // Add Fund Account
//         const fundAccount = await addFundAccount(contact.id, bankDetails);

//         // Process Razorpay Payout
//         const payout = await createPayout(fundAccount.id, amount, "payout");

//         // Notify user
//         const userNotification = new Notification({
//             user: userId,
//             message: `Withdrawal of ₹${amount} has been initiated successfully.`,
//             notificationType: "Wallet",
//         });
//         await userNotification.save({ session });

//         io.to(userId.toString()).emit("notification", {
//             message: userNotification.message,
//             notificationType: userNotification.notificationType,
//             createdAt: Date.now(),
//         });

//         await session.commitTransaction();
//         session.endSession();

//         return res.status(200).json({
//             success: true,
//             message: "Withdrawal successful.",
//             payout,
//         });
        

//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         next(error);
//     }
// }

// dummy check the withdrawal amount form the wallet.

walletCltr.withdrawFunds = async(req,res,next) => {
    const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const userId = req.currentUser.userId;
    const { amount, accountDetails } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      throw new CustomError("Invalid amount. Must be greater than 0.", 400);
    }

    // Fetch user's wallet
    const wallet = await Wallet.findOne({ user: userId }).session(session);
    if (!wallet) {
      throw new CustomError("Wallet not found!", 404);
    }

    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      throw new CustomError("Insufficient wallet balance.", 400);
    }

    // Deduct amount from wallet balance
    // wallet.balance -= amount;
    // await wallet.save({ session });

    // Log transaction (mocking payout)
    await logTransaction({
      walletId: wallet._id,
      transactionType: "Wallet Withdrawal",
      amount: amount,
      referenceId: "MOCK_PAYOUT_ID", // Mock payout reference
      referenceType: "Payout",
      direction: "debit",
      session,
    });

    // Notify user (mock notification)
    const userNotification = new Notification({
      user: userId,
      message: `Your withdrawal request of ₹${amount} has been processed (mock).`,
      notificationType: "wallet",
    });

    await userNotification.save({ session });
    io.to(userId.toString()).emit("notification", {
      message: userNotification.message,
      notificationType: userNotification.notificationType,
      createdAt: Date.now(),
    });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Withdrawal request processed successfully (mock).",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
}
export default walletCltr;
