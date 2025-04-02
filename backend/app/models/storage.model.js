import {Schema, model} from 'mongoose'

const storageSchema = new Schema({
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    product : {
        type : Schema.Types.ObjectId,
        ref : "Product"
    },
    storageName : String,
    storageDescription : String,
    capacity : {
        type : Number,
        default : 1
    },
    address : {
        type : Object,
        street : {type : String},
        city : {type : String},
        state : {type : String},
        postalCode : {type : String},
        country : {
            type : String,
            default : "India"
        }
    },
    geoCoordinates : {
        latitude : {type : String},
        longitude : {type : String}
    },
    pricePerKg : {
        type : Number,
        default : 1
    }
}, {timestamps : true});


const Storage = model("Storage", storageSchema)
export default Storage;
