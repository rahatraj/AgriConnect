import { configureStore } from "@reduxjs/toolkit";
import userReducer from './slices/userSlice'
import socketReducer from './slices/socketSlice'
import productReducer from './slices/productSlice'
import bidReducer from './slices/bidSlice'
import socketMiddleware from "./middlewares/socketMiddleware";
import walletReducer from './slices/walletSlice'
import profileReducer from './slices/profileSlice'
import notificationReducer from "./slices/NotificationSlice"
import adminReducer from './slices/adminSlice'
import transactionReducer from './slices/transactionSlice'
const store = configureStore({
    reducer : {
        users : userReducer,
        socket : socketReducer,
        products : productReducer,
        bids : bidReducer,
        wallet : walletReducer,
        profile : profileReducer,
        notifications : notificationReducer,
        admin : adminReducer,
        transactions : transactionReducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(socketMiddleware)
})

export default store;