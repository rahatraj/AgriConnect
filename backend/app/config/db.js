import mongoose from "mongoose";
import {startBidClosingCron} from '../controllers/cron/bidCron.js'
const configuredDB = async() => {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log(`DB connected Successfully`)
        startBidClosingCron()
    } catch (error) {
        console.log(error)
        console.log(`DB not connected`)
    }
}

export default configuredDB;


// eFmIY4CPY6d8J9M3
// mongodb+srv://rahatreza3199:<db_password>@cluster0.rylqb.mongodb.net/

// mongodb+srv://rahatreza3199:eFmIY4CPY6d8J9M3@cluster0.rylqb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0