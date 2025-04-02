import User from "../models/user.model.js"
import CustomError from "../utils/CustomError.js"

const checkAccountStatus = async (req,res,next)=> {
    try {
        const user = await User.findById(req.currentUser.userId)
        if(!user){
            throw new CustomError("User not found!", 404)
        }
        if(user.status !== 'Active'){
            throw new CustomError("Your account has been blocked. Please contact to the Admin.",403)
        }
        next();
    } catch (error) {
        next(error)
    }
}

export default checkAccountStatus;