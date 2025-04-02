
const storageSchemaValidation = {
    storageName : {
        in : ['body'],
        exists : {
            errorMessage : "Storage name is required."
        },
        notEmpty : {
            errorMessage : "Storage name can not be empty"
        },
        isLength : {
            options : {min : 3},
            errorMessage : "Storage name should be atleast 3 characters long."
        },
        trim : true
    },
    capacity : {
        in : ['body'],
        exists : {
            errorMessage : "Capacity is required."
        },
        notEmpty : {
            errorMessage : "Capacity can not be empty"
        },
        isFloat : {
            errorMessage : "Capacity must be a number and atleast 1 kg or greater."
        },
        trim : true
    },
    pricePerKg : {
        in : ['body'],
        exists : {
            errorMessage : "Price perkg is required."
        },
        notEmpty : {
            errorMessage : "Price perkg can not be empty."
        },
        isFloat : {
            options : {min : 1},
            errorMessage : "Price per kg must be a number and atleast 1 rupees. per kg or greater."
        },
        trim : true
    },
    storageDescription : {
        in : ['body'],
        optional : true,
        isLength : {
            options : {max : 500},
            errorMessage : "Storage description can not be exceed 500 characters."
        },
        trim : true
    },
    address : {
        in : ['body'],
        exists : {
            errorMessage : "Address is required."
        },
        notEmpty : {
            errorMessage : "Address can not be empty"
        },
        custom : {
            options : (value) => {
                if(typeof value !== 'object' || !value.street || !value.city || !value.state || !value.postalCode || !value.country){
                    throw new Error("Address must include street, city, state and postalCode fields.")
                }
                return true;
            }
        },
        trim : true
    }
}

export default storageSchemaValidation;