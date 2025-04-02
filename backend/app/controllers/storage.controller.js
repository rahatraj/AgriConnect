import { validationResult } from "express-validator"
import CustomError from "../utils/CustomError.js"
import { getGeoCoordinates } from "../utils/geoLocation.js"
import Storage from "../models/storage.model.js"

const storageCltr = {}

storageCltr.addStorage = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("validation failed.", 400, errors.array()))
    }
    try {
        const owner = req.currentUser.userId;
        const role = req.currentUser.role;
        const { storageName, storageDescription, pricePerKg, capacity } = req.body;
        // let { address } = req.body;

        // const { street, city, state, postalCode, country } = address;
        // console.log(address)
        // if(typeof address !== "object" || !street || !city || !state || !postalCode || !country){
        //     throw new CustomError("Incomplete address provided. Please include street, city, state, postalCode, and country", 400)
        // }

        if(!owner || role !== "StorageOwner"){
            throw new CustomError("Unauthorized access. Only storage owner can add their properties.", 403)
        }

        //  const fullAddress = `${street},${city},${state},${postalCode},${country}`;

        //  const geoCoordinates = await getGeoCoordinates(fullAddress)

         const newStorage = new Storage({
            owner,
            storageName,
            storageDescription,
            pricePerKg,
            capacity,
            // geoCoordinates,
            // address : {street, city, state, postalCode}
         })

         await newStorage.save()

         return res.status(201).json({
            success : true,
            message : "successfully added the storage.",
            storage : newStorage
         })
    } catch (error) {
        next(error)
    }
}

storageCltr.getStorageDetails = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }
    try {
        const storageId  = req.params.id;
        const storage = await Storage.findById(storageId)
        if(!storage){
            throw new CustomError("record not found!", 404)
        }
        return res.status(200).json({
            success : true,
            message : "storage fetched successfully",
            storage
        })
    } catch (error) {
        next(error)
    }
}

storageCltr.getAllStorage = async(req,res,next) => {
    try {
        const storages = await Storage.find()
        if(!storages){
            throw new CustomError("No storage found!", 404)
        }
        return res.status(200).json({
            success : true,
            message : "Fetched all the storages successfully",
            storages
        })
    } catch (error) {
        next(error)
    }
}
storageCltr.getMyStorage = async(req,res,next)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("Validation failed.", 400, errors.array()))
    }
    try {
        const ownerId = req.currentUser.userId;
        const role = req.currentUser.role;
        if(role !== "StorageOwner"){
            throw new CustomError("Unathorized access. Only Storage Owner can see thier storages", 403)
        }
        const storages = await Storage.find({owner : ownerId})
        if(!storages){
            throw new CustomError("No storages found!", 404)
        }
        return res.status(200).json({
            success : true,
            message : "Fetched all the Storage",
            storages
        })
    } catch (error) {
        next(error)
    }
}

storageCltr.deleteStorage = async(req,res,next)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("validation failed.", 400, errors.array()))
    }
    try {
        const  storageId  = req.params.id;
        const ownerId = req.currentUser.userId;
        const role = req.currentUser.role;
        if(!ownerId || role !== "StorageOwner"){
            throw new CustomError("Unauthorized access. Only Storage Owner can delete thier Storage properties.", 403)
        }

        const storage = await Storage.findOneAndDelete({_id : storageId, owner : ownerId})
        if(!storage){
            throw new CustomError("Storage not found!", 404)
        }
        return res.status(200).json({
            success : true,
            message : "Storage deleted successfully.",
            storage
        })
    } catch (error) {
        next(error)
    }
}

storageCltr.updateStorage = async(req,res,next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(new CustomError("validation failed.", 400, errors.array()))
    }
    try {
        const storageId  = req.params.id;
        const { storageName, storageDescription, pricePerKg, capacity, address} = req.body;
        const ownerId = req.currentUser.userId;
        const role = req.currentUser.role;

        if(!ownerId || role !== "StorageOwner"){
            throw new CustomError("Unauthorized access. Only storage owner can update the storage.", 403)
        }
        const exsitingStorage = await Storage.findOne({_id : storageId, owner : ownerId})
        if(!exsitingStorage){
            throw new CustomError("storage not found!", 404)
        }

        // handle address 
        const updatedAddress = address ?
            {
                street : address.street || exsitingStorage.street,
                city : address.city || exsitingStorage.city,
                state : address.state || exsitingStorage.state,
                postalCode : address.postalCode || exsitingStorage.postalCode
            }
            : exsitingStorage.address;

        // handle geocoordinates

        let geoCoordinates = exsitingStorage.geoCoordinates;
        if(JSON.stringify(address) !== JSON.stringify(exsitingStorage.address)){
            const fullAddress = `${updatedAddress.street}, ${updatedAddress.city}, ${updatedAddress.state}, ${updatedAddress.postalCode}`

            geoCoordinates = await getGeoCoordinates(fullAddress)
        }

        // update data
        const updatedData = {
            ...(storageName && {storageName}),
            ...(storageDescription && { storageDescription }),
            ...(pricePerKg && { pricePerKg}),
            ...(capacity && { capacity }),
            ...(address && { address : updatedAddress}),
            geoCoordinates
        }

        const updatedStorage = await Storage.findByIdAndUpdate(
            { _id : storageId,owner : ownerId },
            updatedData,
            {new : true, runValidators : true}
        )
        return res.status(200).json({
            success : true,
            message : "Storage updated successfully.",
            storage : updatedStorage
        })
    } catch (error) {
        next(error)
    }
}
export default storageCltr;