import User from "../models/user.model.js";

export const userRegisterSchema = {
    fullName : {
        in : ['body'],
        exists : {
            errorMessage : "Full Name is required"
        },
        notEmpty : {
            errorMessage : "Full Name can not be empty"
        },
        isLength : {
            options : {min : 3},
            errorMessage : "Full Name should be atleast 3 characters long."
        },
        trim : true,
    },
    email : {
        in : ['body'],
        exists : {
            errorMessage : "Email is required"
        },
        notEmpty : {
            errorMessage : "Email can not be empty"
        },
        isEmail : {
            errorMessage : "Email must be in format"
        },
        trim : true,
        normalizeEmail : true,
        custom : {
            options : async function(value){
                try {
                    const user = await User.findOne({email : value})
                    if(user){
                        return Promise.reject("Email is already taken")
                    }
                } catch (error) {
                    throw new Error("Error occurred during email validation");
                }
            }
        }
    },
    password : {
        in : ['body'],
        exists : {
            errorMessage : 'Password is required'
        },
        notEmpty : {
            errorMessage : "Password can not be empty"
        },
        isStrongPassword : {
            options : {
                minLength : 8,
                minUppercase : 1,
                minLowercase : 1,
                minSymbol : 1,
                minNumber : 1
            },
            errorMessage : "Password must be conatain atleast one uppercase, one lowercase, one number, one symbol and must be atleast 8 characters long."
        },
        trim : true
    }
}

export const userLoginSchema = {
    email : {
        in : ['body'],
        exists : {
            errorMessage : "Email is required"
        },
        notEmpty : {
            errorMessage : "Email can not be empty"
        },
        isEmail : {
            errorMessage : "Email must be in format"
        },
        trim : true,
        normalizeEmail : true,
    },
    password : {
        in : ['body'],
        exists : {
            errorMessage : 'Password is required'
        },
        notEmpty : {
            errorMessage : "Password can not be empty"
        },
        trim : true
    }
}