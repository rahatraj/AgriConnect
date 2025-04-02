import Wallet from "../models/wallet.model.js";
import { Transaction } from "../models/transaction.model.js";

export const logTransaction = async ({
    walletId,
    transactionType,
    amount,
    referenceId,
    referenceType,
    direction,
    session
}) => {
    if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
        throw new Error("Invalid amount for transaction.");
    }

    const wallet = await Wallet.findById(walletId).session(session);
    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    if (direction === "debit") {
        if (wallet.balance < amount) {
            throw new Error("Insufficient balance.");
        }
        wallet.balance -= amount;
    } else if (direction === "credit") {
        wallet.balance += amount;
    } else {
        throw new Error("Invalid transaction direction. Use 'debit' or 'credit'.");
    }

    // Create a transaction entry
    const transaction = new Transaction({
        user: wallet.user,
        wallet: wallet._id,
        transactionType,
        amount,
        referenceId,
        referenceType,
        transactionDate: new Date()
    });

    await transaction.save({ session });

    // Push the transaction ID to the wallet
    wallet.transactions.push(transaction._id);

    await wallet.save({ session });

    console.log("Wallet user : ", wallet.user)
    console.log("Wallet updated. New balance:", wallet.balance);

    return wallet;
};
