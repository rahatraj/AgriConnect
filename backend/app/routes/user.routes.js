import express from 'express'
import { checkSchema } from 'express-validator'
import { userLoginSchema, userRegisterSchema } from '../validators/user.schema.validation.js'
import userCltr from '../controllers/user.controller.js'
import AuthenticateUser from '../middlewares/authenticate.js'
import upload from '../utils/multerProfilePicUpload.js'
import checkAccountStatus from '../middlewares/checkAccountStatus.js'
import AuthorizedUser from '../middlewares/authorization.js'

const router = express.Router()

router.post("/register", checkSchema(userRegisterSchema), userCltr.register)
router.post("/login", checkSchema(userLoginSchema), userCltr.login)
router.post('/logout', userCltr.logout)

router.post('/update/profile', 
    AuthenticateUser,
    checkAccountStatus,
    upload.single('profilePic') ,
    userCltr.updateProfile
)

router.get("/profile",
    AuthenticateUser, 
    checkAccountStatus, 
    userCltr.getProfile
)

router.get('/me', 
    AuthenticateUser, 
    userCltr.fetchUser
)

router.get("/list",
    AuthenticateUser,
    AuthorizedUser(["Admin"]),
    userCltr.list
)

router.put("/:id/useractivation",
    AuthenticateUser,
    AuthorizedUser(["Admin"]),
    userCltr.userActivation
)

router.get("/getalldetails",
    AuthenticateUser,
    checkAccountStatus,
    AuthorizedUser(["Admin"]),
    userCltr.getAllDetails
)
export default router;