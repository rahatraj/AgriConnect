import { Schema, model } from "mongoose";

const userSchema = new Schema({
    fullName : String,
    email : String,
    password : String,
    role : {
        type : String,
        enum : ["Farmer", "Buyer", "StorageOwner", "Admin"]
    },
    status : {
        type : String,
        default : "Active"
    }
}, {timestamps : true})

const User = model("User", userSchema)

export default User;