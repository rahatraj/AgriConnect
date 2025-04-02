import jwt from 'jsonwebtoken'
import CustomError from '../utils/CustomError.js';

const AuthenticateUser = (req,res,next) => {
    const token = req.cookies.token;
    if(!token){
        return next(new CustomError("Unathenticated user", 403))
    }

    try {
        const tokenData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.currentUser = {userId : tokenData.userId, role : tokenData.role}
        next()
    } catch (error) {
        return next(new CustomError("Invalid or expired token", 401))
    }
}

export default AuthenticateUser;