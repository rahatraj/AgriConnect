import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import CustomError from "../utils/CustomError.js";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Profile from "../models/profile.model.js";
import Wallet from "../models/wallet.model.js";
import Bid from "../models/bid.model.js";
import Product from "../models/product.model.js";
import { Transaction } from "../models/transaction.model.js";


const userCltr = {}

userCltr.register = async(req,res,next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed", 400, errors.array()))
    }

    const {fullName, email, password, adminToken, role} = req.body

    try {

        const validRoles = ["Farmer", "Buyer", "StorageOwner", "Admin"];
        if (!validRoles.includes(role)) {
            throw new CustomError("Invalid role specified", 400);
        }

        const user = new User({fullName, email})

        const salt = await bcryptjs.genSalt();
        user.password = await bcryptjs.hash(password, salt)
        
        if(role === "Admin"){
            if(adminToken === process.env.ADMIN_SECRET_TOKEN){
                user.role = "Admin"
            }else{
                throw new CustomError("Invalid admin token", 403);
            }
        }else{
            user.role = role;
        }

        await user.save()

        await Profile.create({user : user._id})

        return res.status(201).json({
            success : true,
            message : "User registered successfully",
            user
        })
        
    } catch (error) {
        next(error)
    }
}

userCltr.login = async(req,res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed", 400, errors.array()))
    }

    try {
        const { email, password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            throw new CustomError("Invalid email or password", 404)
        }

        if(user.status !== "Active"){
            throw new CustomError("Your Account has been deactivated. Please contact to the Admin", 403)
        }

        const isVerified = await bcryptjs.compare(password,user.password)
        if(!isVerified){
            throw new CustomError("Invalid email or password", 404)
        }

        const token = jwt.sign({userId : user._id, role : user.role}, process.env.JWT_SECRET_KEY, {expiresIn : '7d'})

        const userData = {
            _id : user._id,
            fullName : user.fullName,
            email : user.email,
            role : user.role
        }

        return res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === 'production'
        }).json({
            success : true,
            message : "successfully logged in",
            user : userData
        })
    } catch (error) {
        next(error)
    }
}

userCltr.logout = async(req,res,next) => {
    try {
        res.cookie('token', "", {
            maxAge: 0,
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === 'production'
        })
        return res.status(200).json({
            success : true,
            message : "Successfully logged out"
        })
    } catch (error) {
        next(error)
    }
}

userCltr.updateProfile = async(req,res,next) => {
    try {
        const userId = req.currentUser.userId;
        const imageUrl = req.file ? req.file.path : null;
        const { contactNumber, languagePreference } = req.body;
        
        // select only provided data
        const updateData = {
            ...(contactNumber && {contactNumber}), 
            ...(languagePreference && {languagePreference}),
            ...(imageUrl && {profilePic : imageUrl})
        }

        const profile = await Profile.findOneAndUpdate(
            {user : userId},
            {$set : updateData}, // update only provided data
            {new : true, runValidators : true}
        )

        await Wallet.create({user : userId})
        return res.status(200).json({
            success : true,
            message : "Profile has been updated",
            profile
        })
    } catch (error) {
        next(error)
    }
}
userCltr.getProfile = async(req,res,next)=>{
    try {
        const profile = await Profile.findOne({user : req.currentUser.userId})
            .populate("user", "fullName email")
        if(!profile){
            throw new CustomError("Profile couldn't fetch", 404)
        }
        return res.status(200).json({
            success : true,
            message : "Profile fetched successfully.",
            profile
        })
    } catch (error) {
        next(error)
    }
}
userCltr.fetchUser = async(req,res,next) => {
    try {
        const user = await User.findById(req.currentUser.userId).select('-password');
        if(!user){
            throw new CustomError("User not found", 404);
        }
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
}
userCltr.list = async(req,res,next)=> {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            role = "",
            status = "",
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        // Build query
        const query = { role: { $ne: "Admin" } };
        
        // Add search filter
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }

        // Add role filter
        if (role) {
            query.role = role;
        }

        // Add status filter
        if (status) {
            query.status = status;
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitValue = parseInt(limit);

        // Execute query with pagination
        const [users, total] = await Promise.all([
            User.find(query)
                .select("-password") // Exclude password
                .sort(sort)
                .skip(skip)
                .limit(limitValue)
                .lean(),
            User.countDocuments(query)
        ]);

        if (!users) {
            throw new CustomError("No users found.", 404);
        }

        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: limitValue,
                    totalPages: Math.ceil(total / limitValue)
                }
            },
            message: "Users fetched successfully."
        });
    } catch (error) {
        next(error);
    }
}
userCltr.userActivation = async(req,res,next) => {
    try {
        const adminId = req.currentUser.userId;
        const role = req.currentUser.role;
        const userId = req.params.id;
        const { userStatus } = req.body;

        if(!adminId || role !== "Admin"){
            throw new CustomError("Only admin can activate the user.", 403)
        }

        // Validate status
        if(!userStatus || !["Active", "Suspended"].includes(userStatus)){
            throw new CustomError("Invalid status. Must be either Active or Suspended", 400)
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { status: userStatus },
            { new: true, runValidators: true }
        ).select("fullName email role status");

        if(!user){
            throw new CustomError("User not found.", 404)
        }

        return res.status(200).json({
            success: true,
            message: `User status successfully updated to ${userStatus}`,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        console.error("Error in userActivation:", error);
        next(error)
    }
}

userCltr.getAllDetails = async(req,res,next)=> {
    try {
        const totalUser = await User.countDocuments()
        const totalBids = await Bid.countDocuments()
        const totalProducts = await Product.countDocuments()
        const completedTransactions = await Transaction.countDocuments()

        return res.status(200).json({
            success : true,
            data : {
                totalUser,
                totalBids,
                totalProducts,
                completedTransactions
            }
        })
    } catch (error) {
        next(error)
    }
}
export default userCltr;