import { validationResult } from "express-validator";
import CustomError from "../utils/CustomError.js";
import Product from "../models/product.model.js";
import { v2 as cloudinary } from "cloudinary";
import { getGeoCoordinates } from "../utils/geoLocation.js";
import Bid from "../models/bid.model.js";


const productCltr = {}

productCltr.create = async(req,res, next)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed", 400, errors.array()))
    }
    try {
        const { productName, productDescription, category, address } = req.body;

        const { street, city, state, postalCode,country } = address;

        const farmer = req.currentUser.userId
        const role = req.currentUser.role

        if(!farmer || role !== "Farmer"){
            throw new CustomError("Unauthorized access. Only Farmer can add the products.", 403)
        }

        // handle multiple images for product
        console.log(req.files)
        let productImages = [];
        if(req.files && req.files.length > 0){
             productImages = req.files.map((file)=> ({
                url : file.path,
                publicId : file.filename
            }))
        }else {
            throw new CustomError("No images uploaded", 400);
        }

        const fullAddress = `${street}, ${city}, ${state}, ${postalCode}, ${country}`

        // geoLocation of product 
        const geoCoordinates = await getGeoCoordinates(fullAddress)

        const product = new Product({
            farmer,
            productName,
            productDescription,
            productImages,
            category,
            address,
            geoCoordinates
        })

        await product.save();

        return res.status(201).json({
            success : true,
            message : 'Product has been created successfully'
        })
    } catch (error) {
        next(error)
    }
}

productCltr.remove = async(req,res) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed", 400, errors.array()))
    }

    try {
        const productId  = req.params.id;
        const farmerId = req.currentUser.userId
        const product = await Product.findOne({_id : productId, farmer : farmerId})
        if(!product){
            throw new CustomError("Product not found.", 404)
        }

        if(req.currentUser.role !== "Farmer"){
            throw new CustomError("you are not authorized. Only farmer can delete the product.", 403)
        }

        // delete image form cloudinary 
        for(const image of product.productImages){
            await cloudinary.uploader.destroy(image.publicId)
        }

        // Delete all associated bids
        await Bid.deleteMany({ product: productId });

        // delete the project from the database 
        await product.deleteOne();

        return res.status(200).json({
            sucess : true,
            message : 'Product and associated bids deleted successfully',
        })
    } catch (error) {
        next(error)
    }
}

productCltr.getAllProducts = async(req,res, next) => {
    try {
        const { page = 1, limit = 10, category, status, search, minPrice, maxPrice, farmerId }  = req.query;

        const filter = {};

        if(category){
            filter.category = category;
        }
        if(status){
            filter.status = status
        }

        if(search){
            // search product by name 
            filter.$or = [
                {productName : { $regex : search, $options: "i"}},
                {productDescription : {$regex : search, $options : "i"}}
            ]
        }

        if(minPrice || maxPrice) {
            filter.basePrice = {};
            if(minPrice){
                filter.basePrice.$gte = parseFloat(minPrice);
                filter.basePrice.$lte = parseFloat(maxPrice)
            }
        }

        if(farmerId){
            filter.farmerId = farmerId
        }

        const pageNumber = parseInt(page,10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // fetch products with filtering, pagination, and sorting (newest first)
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt : -1 }); // newest first

        // Get total count of matching products
        const total = await Product.countDocuments(filter);

        return res.status(200).json({
            success : true,
            message : "Product fetched successfully",
            data : products,
            pagination : {
                total,
                page : pageNumber,
                limit : limitNumber,
                totalPages : Math.ceil(total / limitNumber)
            }
        });
    } catch (error) {
        next(error)   
    }
}

productCltr.myProducts = async (req, res, next) => {
    try {
        const farmerId = req.currentUser.userId;
        const { page = 1, limit = 10, sort = "latest", category, search } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Filter conditions
        let filter = { farmer: farmerId };

        if (search) {
            filter["$or"] = [
                { productName: { $regex: search, $options: "i" } },
                { productDescription: { $regex: search, $options: "i" } }
            ];
        }

        if (category) {
            filter.category = category; // Filter by category
        }

        let sortOptions = {};
        if (sort === "latest") sortOptions = { createdAt: -1 };
        if (sort === "oldest") sortOptions = { createdAt: 1 };

        // Fetch paginated and sorted products
        const products = await Product.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNumber);

        // Get total count for frontend pagination
        const totalProducts = await Product.countDocuments(filter);

        return res.status(200).json({
            success: true,
            message: "Fetched products successfully.",
            products,
            pagination: {
                total: totalProducts,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalProducts / limitNumber),
            },
        });
    } catch (error) {
        next(error);
    }
};


productCltr.showProduct = async(req,res,next)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        throw new CustomError("Validation failed", 400, false)
    }

    try {
        const productId = req.params.id;
        console.log("product id controller : ",productId)
        const product = await Product.findById(productId)
            .populate("farmer", "fullName email")
            .populate("bids")

        
        if(!product){
            throw new CustomError("Product not found!", 404)
        }

        let bidDetails = null;
        if(product.status === "Bidding"){
            bidDetails = await Bid.findOne({product : productId})
                .populate("bidders.buyer", "name email")
                .populate("winner", "name email")
        }
        console.log("Products ", product)
        console.log("Bid Details ", bidDetails)
        return res.status(200).json({
            success : true,
            message : "Product fetched successfully.",
            product,
            bidDetails
        })
    } catch (error) {
        next(error)
    }
}

productCltr.update = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }

    try {
        const { productName, productDescription, address, category } = req.body;
        
        const farmerId = req.currentUser.userId;
        const productId = req.params.id;
        if(req.currentUser.role !== "Farmer"){
           throw new CustomError("Unathorized access. Only Farmer can update the product", 403)
        }
        const existingProduct = await Product.findOne({_id : productId, farmer : farmerId})

        if(!existingProduct){
            throw new CustomError("Product not found!", 404)
        }

        // handle product images if provided
        let updatedImages = existingProduct.productImages;
        if(req.files && req.files.length > 0){
            for(const image of existingProduct.productImages){
                await cloudinary.uploader.destroy(image.publicId)
            }

            updatedImages = req.files.map((file)=> ({
                url : file.path,
                publicId : file.filename
            }))
        }

        // Handle optional address updates
        const updatedAddress = address
        ? {
                street: address.street || existingProduct.address.street,
                city: address.city || existingProduct.address.city,
                state: address.state || existingProduct.address.state,
                postalCode: address.postalCode || existingProduct.address.postalCode,
            }
        : existingProduct.address;
        
        // Handle GeoCoordiantes if Address changes 
        let geoCoordinates = existingProduct.geoCoordinates
        if(address && JSON.stringify(address) !== JSON.stringify(existingProduct.address)){
            const fullAddress = `${updatedAddress.street}, ${updatedAddress.city}, ${updatedAddress.state}, ${updatedAddress.postalCode}`;

            geoCoordinates = await getGeoCoordinates(fullAddress)
        }
        // Prepare updated data
        const updatedData = {
            ...(productName && { productName }),
            ...(productDescription && { productDescription }),
            ...(updatedImages && { productImages: updatedImages }),
            ...(address && { address: updatedAddress }),
            ...(category && { category }),
            geoCoordinates
        };


        const updatedProduct = await Product.findOneAndUpdate(
            {_id : productId, farmer : farmerId}, 
            updatedData, 
            {new : true, runValidators : true}
        )

        return res.status(200).json({
            success : true,
            message : "Product updated successfully.",
            product : updatedProduct
        })
    } catch (error) {
        next(error)
    }
}

productCltr.getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params; 
        const { page = 1, limit = 10 } = req.query;

        const filter = { category };

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Fetch products by category with pagination
        const products = await Product.find(filter)
            .skip(skip)
            .limit(limitNumber)
            .sort({ createdAt: -1 }); // Sort by newest first

        // Get total count of matching products
        const total = await Product.countDocuments(filter);

        if (!products.length) {
            throw new CustomError(`No products found for category: ${category}`, 404);
        }

        return res.status(200).json({
            success: true,
            message: `Products fetched successfully for category: ${category}`,
            data: products,
            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
            },
        });
    } catch (error) {
        next(error);
    }
};


export default productCltr;