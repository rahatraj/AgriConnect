import express from 'express';
import AuthenticateUser from "../middlewares/authenticate.js";
import { checkSchema } from 'express-validator';
import storageTransactionCltr from '../controllers/storageTransaction.controller.js';
import AuthorizedUser from '../middlewares/authorization.js';
import { idValidation, validateStorageId } from '../validators/idValidation.js';

const router = express.Router();

router.post("/:storageId/booking", 
    AuthenticateUser,
    AuthorizedUser(["Farmer", "Buyer"]),
    validateStorageId,
    storageTransactionCltr.createBooking
)

router.post("/:storageId/booking/:transactionId/confirm-arrival",
    AuthenticateUser,
    AuthorizedUser(["Farmer", "Buyer"]),
    idValidation,
    storageTransactionCltr.confirmArrivalAndPay
)

router.get("/:storageId/booking/:transactionId/cancel",
    AuthenticateUser,
    AuthorizedUser(["Farmer","Buyer"]),
    idValidation,
    storageTransactionCltr.cancelBooking
)

router.get("/:storageId/transactions", 
    AuthenticateUser,
    AuthorizedUser(["Admin", "StorageOwner"]),
    validateStorageId,
    storageTransactionCltr.getAllTransactions
)
export default router;