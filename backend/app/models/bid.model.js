import { Schema, model } from "mongoose";

const bidSchema = new Schema({
    product : {
        type : Schema.Types.ObjectId,
        ref : "Product"
    },
    bidders : [
        {
            buyer : {
                type : Schema.Types.ObjectId,
                ref : "User"
            },
            bidAmount : {
                type : Number
            },
            bidTime : {
                type : Date,
                default : Date.now
            },

        },
    ],
    currentHighestBid : {
        type : Number,
        default : 0
    },
    winner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    basePrice : {
        type : Number,
        default : 0
    },
    quantity : {
        type : Number,
        default : 5, // only in kg
    },
    biddingDeadLine : Date,
    bidStatus : {
        type : String,
        enum : ['Open', 'Close'],
        default : "Open"
    }
}, {timestamps : true})

const Bid = model("Bid", bidSchema)

export default Bid;