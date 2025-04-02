const bidSchemaValidation = {
    basePrice: {
        in: ["body"],
        exists: {
            errorMessage: "Base Price is required",
        },
        notEmpty: {
            errorMessage: "Base Price cannot be empty",
        },
        isNumeric: {
            errorMessage: "Base Price must be a number",
        },
        trim: true,
    },

    quantity: {
        in: ["body"],
        exists: {
            errorMessage: "Quantity is required",
        },
        notEmpty: {
            errorMessage: "Quantity cannot be empty",
        },
        isInt: {
            options: { min: 1 },
            errorMessage: "Quantity must be a positive integer",
        },
        trim: true,
    },

    biddingDeadLine: {
        in: ["body"],
        exists: {
            errorMessage: "Bidding deadline is required",
        },
        notEmpty: {
            errorMessage: "Bidding deadline cannot be empty",
        },
        isISO8601: {
            errorMessage: "Date must be in YYYY-MM-DDTHH:mm format",
        },
        custom: {
            options: (value) => {
                const currentDate = new Date();
                const inputDate = new Date(value);
                if (inputDate <= currentDate) {
                    throw new Error("Bidding deadline must be a future date and time");
                }
                return true;
            },
        },
        trim: true,
    },
};

export default bidSchemaValidation;
