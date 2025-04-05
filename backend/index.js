import express from 'express'
import cors from 'cors'
import { app, server } from './app/config/socket.js'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import configuredDB from './app/config/db.js'
import morgan from 'morgan'
import userRoutes from './app/routes/user.routes.js'
import productRoutes from './app/routes/productRoutes.js'
import bidRoutes from './app/routes/bid.routes.js'
import storageRoutes from './app/routes/storage.routes.js'
import storageTransactionRoutes from './app/routes/storageTransaction.routes.js'
import walletRoutes from './app/routes/wallet.routes.js'
import errorHandler from './app/middlewares/errorHandler.js'
import transactionRoutes from './app/routes/transaction.routes.js'
import { startBidClosingCron } from './app/controllers/cron/bidCron.js'

// Load environment variables
config()

const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
const localHost = 'http://localhost:5173'


app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
} else {
    app.use(morgan('combined'))
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/bids", bidRoutes)
app.use("/api/v1/storages", storageRoutes)
app.use("/api/v1/storage-transactions", storageTransactionRoutes)
app.use("/api/v1/transactions", transactionRoutes)
app.use("/api/v1/wallets", walletRoutes)

// Error handling
app.use(errorHandler)

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' })
})

// Start server
const startServer = async () => {
    try {
        await configuredDB()
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV} mode`)
            startBidClosingCron()
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err)
    // Close server & exit process
    server.close(() => process.exit(1))
})