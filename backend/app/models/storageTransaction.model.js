import { Schema, model } from "mongoose";

const storageTransactionSchema = new Schema({
    storage : {
        type : Schema.Types.ObjectId,
        ref : "Storage"
    },
    bookings : [{
        farmer : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        buyer : {
            type : Schema.Types.ObjectId,
            ref : "User"
        },
        quantity : {
            type : Number,
            default : 1
        },
        bookingFee : {
            type : Number,
            default : 1
        },
        remainingCost : {
            type : Number,
            default : 1
        },
        totalCost : {
            type : Number,
            default : 1
        },
        paymentStatus : {
            type : String,
            enum : ["Booking Fee Paid","Fully Paid", "Refunded"],
            default : "Booking Fee Paid"
        },
        startDate : {
            type : Date,
            default : Date.now
        },
        endDate : {
            type : Date
        },
        status : {
            type : String,
            enum : ["Confirmed","Cancelled", "Pending Arival"],
            default : "Pending Arival"
        }

    }],
    payouts : [{
        amount : {
            type : Number,
            default : 1
        },
        payoutDate : {
            type : Date,
            default : Date.now
        },
        status : {
            type : String,
            enum : ["Completed", "Pending"],
            default : "Pending"
        },
        transactionType : {
            type : String,
            enum : ["Booking Payment", "Refund"],
        }
    }]
}, {timestamps : true})

const StorageTransaction = model("StorageTransaction", storageTransactionSchema)

export default StorageTransaction;