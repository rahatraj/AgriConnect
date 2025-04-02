import { Schema, model } from "mongoose";

const profileSchema = new Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    contactNumber : Number,
    profilePic : {
        type : String,
        default : null
    },
    languagePreference : {
        type : String,
        default : "English"
    }
}, {timestamps : true})


const Profile = model("Profile", profileSchema)

export default Profile;