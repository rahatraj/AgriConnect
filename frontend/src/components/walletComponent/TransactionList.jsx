import React from "react";

function TransactionList({ transactions }) {
    // Sort transactions in descending order (latest first)
    let sortedTransactions;
    if(transactions?.length > 0){
        sortedTransactions = [...transactions].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
    }

    return (
        <div className="card bg-base-200 p-4 sm:p-6 shadow-md">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 text-center sm:text-left">Transaction History</h2>
            <ul className="space-y-3">
                {sortedTransactions?.length > 0 ? (
                    sortedTransactions.map((tx, index) => {
                        // Determine text color based on transaction type
                        const isPositive = ["Bid Received", "Wallet Recharge", "Storage Refund", "Transefer In", "Bid Refund"].includes(tx.transactionType);
                        return (
                            <li 
                                key={index} 
                                className="flex flex-wrap justify-between items-center p-3 border-b text-sm sm:text-base"
                            >
                                <div className="w-full sm:w-auto">
                                    <p className="font-medium">{tx.transactionType}</p>
                                    <span className="text-gray-500 text-xs sm:text-sm">
                                        {new Date(tx.transactionDate).toLocaleString()}
                                    </span>
                                </div>
                                <p className={`font-bold ${isPositive ? "text-green-600" : "text-red-500"}`}>
                                    {isPositive ? `+₹${tx.amount}` : `-₹${Math.abs(tx.amount)}`}
                                </p>
                            </li>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-center">No transactions found.</p>
                )}
            </ul>
        </div>
    );
}

export default TransactionList;
