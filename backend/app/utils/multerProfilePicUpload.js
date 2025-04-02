import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import cloudinary from '../config/cloudinary.js'
import CustomError from './CustomError.js';

const storage = new CloudinaryStorage({
    cloudinary : cloudinary,
    params : {
        folder : 'profilePic',
        transformation: [{ width: 500, height: 500, crop: 'fill' }], // Resize images
    }
});

const upload = multer({
    storage,
    fileFilter : (req,file,cb) => {

        if (!file) {
            cb(new CustomError("No file uploaded", 400), false);
        }

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if(allowedMimeTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new CustomError("Invalid file type. Only jpeg, png and jpg are supported", 400), false)
        }
    },
    limits : {fileSize : 5 * 1024 * 1024} // 5 mb limits

})

export default upload;