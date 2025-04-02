import express from 'express'
import { check, checkSchema } from 'express-validator'

import AuthenticateUser from '../middlewares/authenticate.js'
import AuthorizedUser from '../middlewares/authorization.js'
import bidSchemaValidation from '../validators/bid.schema.validation.js'
import { singleIdValidation } from '../validators/idValidation.js'
import bidCltr from '../controllers/bid.controller.js'
import checkAccountStatus from '../middlewares/checkAccountStatus.js'


const router = express.Router()

router.post("/start/:id", 
       AuthenticateUser,
       checkAccountStatus, 
       AuthorizedUser(["Farmer"]), 
       singleIdValidation,
       checkSchema(bidSchemaValidation),
       bidCltr.startBidding
)

router.post("/:id/place", 
      AuthenticateUser,
      checkAccountStatus,
      singleIdValidation,
      bidCltr.placeBid
)

router.post("/:id/close",
      AuthenticateUser,
      checkAccountStatus,
      AuthorizedUser(["Farmer"]),
      singleIdValidation,
      bidCltr.closeBid
)

router.get('/ongoing', 
      AuthenticateUser,
      checkAccountStatus,
      AuthorizedUser(["Farmer"]),
      bidCltr.viewMyOngoingBids
)
router.get("/list",
      AuthenticateUser,
      checkAccountStatus,
      bidCltr.getAllBids
)
router.get("/stats",
      AuthenticateUser,
      checkAccountStatus,
      bidCltr.getFarmerStats
)
router.get("/stats/buyer",
      AuthenticateUser,
      checkAccountStatus,
      bidCltr.getBuyerStats
)
router.get("/myhistory",
      AuthenticateUser,
      checkAccountStatus,
      bidCltr.biddingHistory
)
router.get("/:id/details",
      AuthenticateUser,
      checkAccountStatus,
      singleIdValidation,
      bidCltr.viewBidDetails
)

export default router;