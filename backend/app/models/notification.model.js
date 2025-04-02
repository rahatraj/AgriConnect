import {Schema, model} from 'mongoose'

const notificationSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
    },
    message : {
        type : String,
        maxlength : 255,
    },
    read : {
        type : Boolean,
        default : false
    },
    notificationType : {
        type : String,
        enum : ['Bidding', 'Wallet', 'System', 'Storage']
    }
}, {timestamps : true})

const Notification = model("Notification", notificationSchema)

export default Notification;