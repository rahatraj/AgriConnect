import express from 'express'
import AuthenticateUser from '../middlewares/authenticate.js'
import walletCltr from '../controllers/wallet.controller.js'
import { checkSchema } from 'express-validator'

const router = express.Router()

router.get("/details", 
    AuthenticateUser,
    walletCltr.getWalletDetails
)

router.post("/add-funds",
    AuthenticateUser,
    walletCltr.addFunds
)
router.post("/verify-payment",
    AuthenticateUser,
    walletCltr.verifyPayment
)
router.get("/transactions/history",
    AuthenticateUser,
    walletCltr.getTransactionHistory
)

router.post("/transfer", 
    AuthenticateUser, 
    walletCltr.transferFunds
)
router.post("/withdraw", 
    AuthenticateUser,
    walletCltr.withdrawFunds
)
export default router;