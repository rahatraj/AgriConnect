import { param } from "express-validator";

export const singleIdValidation = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("ID is required.")
        .isMongoId()
        .withMessage("Invalid MongoDB ID.")
]

export const validateStorageId = [
    param("storageId")
        .isMongoId()
        .withMessage("Invalid storage ID.")
]

export const idValidation = [
    param("storageId")
        .isMongoId()
        .withMessage("Invalid Storage ID."),

    param("transactionId")
        .isMongoId()
        .withMessage("Invalid transaction ID.")
]
