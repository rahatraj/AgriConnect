import CustomError from "../utils/CustomError.js"

const AuthorizedUser = (permittedRoles) => {
    return (req,res,next)=> {
        if(permittedRoles.includes(req.currentUser.role)){
            next()
        }else{
            return next(new CustomError("Unauthorized Access. Only Farmers can create the Product.", 403))
        }
    }
}

export default AuthorizedUser;