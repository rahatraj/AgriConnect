import { Schema, model } from "mongoose";
const transactionSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User",
    },
    wallet : {
        type : Schema.Types.ObjectId,
        ref : "Wallet"
    },
    transactionType: {
        type: String,
        enum: ["Bid Deduction", "Bid Refund", "Bid Received", "Storage Payment", "Storage Refund", "Payout", "Wallet Recharge", "Transfer Out", "Transfer In", "Withdrawal", "Deposit"]
    },
    amount: {
        type: Number,
        default: 0
    },
    referenceId: {
        type: String, 
        refPath: "referenceType"
    },
    referenceType: {
        type: String,
        enum: ["Product", "Storage", "Wallet", "Deposit", "Withdraw", "Payment"]
    },
    transactionDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps : true}); 

export const Transaction = model("Transaction", transactionSchema)