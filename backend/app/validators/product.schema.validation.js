const productSchemaValidation = {
    productName: {
        in: ['body'],
        exists: {
            errorMessage: "Product Name is required"
        },
        notEmpty: {
            errorMessage: "Product Name cannot be empty"
        },
        isLength: {
            options: { min: 3 },
            errorMessage: "Product Name must be at least 3 characters long."
        },
        trim: true
    },

    productDescription: {
        in: ['body'],
        optional: true,
        notEmpty: {
            errorMessage: "Product Description cannot be empty"
        },
        isLength: {
            options: { max: 500 },
            errorMessage: "Product Description cannot exceed 500 characters."
        },
        trim: true
    },

    productImages: {
        in: ['body'],
        optional: true,
        custom: {
            options: (value) => {
                if (!Array.isArray(value) || value.length === 0) {
                    throw new Error("Product Images must be a non-empty array of strings.");
                }
                if (!value.every((url) => typeof url === "string")) {
                    throw new Error("Each product image must be a valid string URL.");
                }
                return true;
            }
        }
    },

    category: {
        in: ['body'],
        exists: {
            errorMessage: "Category is required"
        },
        notEmpty: {
            errorMessage: "Category cannot be empty"
        },
        isIn: {
            options: [["Grains", "Vegetables", "Fruits"]],
            errorMessage: "Invalid category. Allowed categories are Grains, Vegetables, or Fruits."
        },
        trim: true
    },

    address: {
        in: ['body'],
        exists: {
            errorMessage: "Address is required"
        },
        notEmpty: {
            errorMessage: "Address cannot be empty"
        },
        custom: {
            options: (value) => {
                if (typeof value !== "object" || !value.street || !value.city || !value.state || !value.postalCode) {
                    throw new Error("Address must include street, city, state, and postalCode fields.");
                }
                return true;
            }
        }
    }
};

export default productSchemaValidation;
