import { Transaction } from "../models/transaction.model.js"
import CustomError from "../utils/CustomError.js"
import { validationResult } from "express-validator"

const transactionCltr = {}

transactionCltr.allTransactions = async(req,res,next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new CustomError("Validation Failed.", 400, errors.array()));
        }

        // Get query parameters with defaults
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortBy = req.query.sortBy || 'transactionDate';
        const order = req.query.order === 'asc' ? 1 : -1;
        const type = req.query.type || '';
        const search = req.query.search || '';

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Build filter object
        let filter = {};
        
        // Add type filter if specified
        if (type) {
            filter.transactionType = { $regex: type, $options: 'i' };
        }

        // Add search filter if specified (search by referenceId)
        if (search) {
            filter.referenceId = { $regex: search, $options: 'i' };
        }

        // Get total count for pagination
        const total = await Transaction.countDocuments(filter);

        // Fetch transactions with pagination, sorting, and population
        const transactions = await Transaction.find(filter)
            .populate('user', 'fullName email')
            .populate('wallet', 'balance')
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit)
            .lean();

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        // Calculate stats
        const stats = {
            total: total,
            completed: await Transaction.countDocuments({ ...filter, status: 'Completed' }),
            pending: await Transaction.countDocuments({ ...filter, status: 'Pending' }),
            totalAmount: (await Transaction.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]))[0]?.total || 0
        };

        return res.status(200).json({
            success: true,
            message: "Transactions fetched successfully",
            data: {
                transactions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalTransactions: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                stats
            }
        });
    } catch (error) {
        next(error);
    }
}

export default transactionCltr;