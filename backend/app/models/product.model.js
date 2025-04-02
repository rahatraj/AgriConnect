import { Schema, model } from "mongoose";

const productSchema = new Schema({
    farmer : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    productName : String,
    productDescription : String,
    productImages: [
        {
            url: { type: String, required: true }, 
            publicId: { type: String, required: true }, // Cloudinary public ID
        },
    ],
    category : {
        type : String,
        enum : ["Grains", "Vegetables", "Fruits"]
    },
    status : {
        type : String,
        enum : ['Available', "Bidding", "Sold"],
        default : "Available"
    },
    address : {
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
    bids : [{
        type : Schema.Types.ObjectId,
        ref : "Bid"
    }]

}, {timestamps : true})

const Product = model("Product", productSchema)

export default Product;