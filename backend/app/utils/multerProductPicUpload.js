import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import CustomError from "./CustomError.js";

const productStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder : "products",
        format : async (req,file) => "png" || "jpeg" || "jpg",
        TransformStream : [{width : 500, height : 500, crop : "fill"}]
    }
});

const productUpload = multer({
    storage : productStorage,
    fileFilter : (req,file, cb) => {

        if(!file){
            cb(new CustomError("No file uploaded", 400), false)
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new CustomError("Invalid file type. Only jpeg, png and jpg are supported."))
        }
    },
    limits : {fileSize : 5 * 1024 * 1024}
})

export default productUpload;