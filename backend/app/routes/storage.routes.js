import express from 'express'
import { checkSchema } from 'express-validator'
import AuthenticateUser from '../middlewares/authenticate.js'
import AuthorizedUser from '../middlewares/authorization.js'
import storageSchemaValidation from '../validators/storage.schema.validation.js'
import storageCltr from '../controllers/storage.controller.js'
import { singleIdValidation } from '../validators/idValidation.js'


const router = express.Router()

router.post("/add", 
    AuthenticateUser, 
    AuthorizedUser(["StorageOwner"]), 
    // checkSchema(storageSchemaValidation),
    storageCltr.addStorage 
)
router.get("/show/:id", AuthenticateUser, storageCltr.getStorageDetails)
router.get("/my", 
    AuthenticateUser, 
    AuthorizedUser(["StorageOwner"]), 
    singleIdValidation,
    storageCltr.getMyStorage
)
router.get("/all", AuthenticateUser, storageCltr.getAllStorage)
router.delete("/delete/:id",
    AuthenticateUser,
    AuthorizedUser(["StorageOwner"]),
    singleIdValidation,
    storageCltr.deleteStorage
)
router.patch("/update/:id", 
    AuthenticateUser,
    AuthorizedUser(["StorageOwner"]),
    singleIdValidation,
    storageCltr.updateStorage

)
export default router;