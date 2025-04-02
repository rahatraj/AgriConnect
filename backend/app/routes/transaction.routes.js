import express from 'express';
import AuthenticateUser from "../middlewares/authenticate.js";
import AuthorizedUser from '../middlewares/authorization.js';
import transactionCltr from '../controllers/transactionCltr.js';

const router = express.Router();

// Get all transactions (Admin only)
router.get("/", 
    AuthenticateUser,
    AuthorizedUser(["Admin"]),
    transactionCltr.allTransactions
);

export default router; 