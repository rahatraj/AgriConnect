import express from 'express'
import { checkSchema } from 'express-validator';
import AuthenticateUser from '../middlewares/authenticate.js'
import AuthorizedUser from '../middlewares/authorization.js';

import productCltr from '../controllers/product.controller.js';

import productSchemaValidation from '../validators/product.schema.validation.js';
import productUpload from '../utils/multerProductPicUpload.js';
import { singleIdValidation } from '../validators/idValidation.js';
import parseFormData from '../middlewares/parseFormData.js';

const router = express.Router()

router.post('/add', 
        AuthenticateUser,
        AuthorizedUser(["Farmer"]),
        productUpload.array("productImages", 5),
        parseFormData,
        checkSchema(productSchemaValidation), 
        productCltr.create
    );

router.delete('/delete/:id',
        AuthenticateUser,
        AuthorizedUser(["Farmer"]),
        singleIdValidation,
        productCltr.remove
)

router.get('/list', productCltr.getAllProducts)
router.get("/my-products", AuthenticateUser, AuthorizedUser(['Farmer']), productCltr.myProducts)
router.get('/show/:id', 
        singleIdValidation,
        productCltr.showProduct
)

// for partially updation use patch, put -> full updation of every field
router.patch('/update/:id',
        AuthenticateUser,
        AuthorizedUser(["Farmer"]),
        singleIdValidation,
        productUpload.array("productImages", 5),
        productCltr.update
)

router.get("/category/:category", productCltr.getProductsByCategory)

export default router;