import { Schema, model } from "mongoose";

const walletSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    walletType : {
        type : String,
        enum : ["Farmer","Buyer", "StorageOwner", "Admin"]
    },
    balance : {
        type : Number,
        default : 0
    },
    transactions : [
        {
            type : Schema.Types.ObjectId,
            ref : "Transaction"
        }
    ]
}, {timestamps : true})

const Wallet = model("Wallet", walletSchema)

export default Wallet;