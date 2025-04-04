import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getTransactionHistory } from "../../redux/slices/walletSlice";
import TransactionList from "../../components/walletComponent/TransactionList";
import { Loader } from "lucide-react";
import ErrorComponent from "../../components/common/ErrorComponent";

const TransactionHistory = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { transactions, loading,error } = useSelector((state) => state.wallet);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [showError, setShowError] = useState(true);

    useEffect(() => {
        dispatch(getTransactionHistory());
    }, [dispatch]);

    // Transaction Categories
    const groupedCategories = {
        "Bid Transactions": ["Bid Deduction", "Bid Refund", "Bid Received"],
        "Wallet Transactions": ["Wallet Recharge", "Withdrawal", "Payout"],
        "Transfers": ["Transfer In", "Transfer Out"],
        "Storage Transactions": ["Storage Payment", "Storage Refund"],
    };

    // Filter transactions based on category and search query
    const filteredTransactions = transactions?.filter((tx) => {
        const isCategoryMatch = selectedCategory
            ? groupedCategories[selectedCategory]?.includes(tx.transactionType)
            : true;
        const isSearchMatch = searchQuery
            ? tx.transactionType.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return isCategoryMatch && isSearchMatch;
    });

    if (loading) {
        return (
          <div className="flex items-center justify-center h-screen">
            <Loader className="size-10 animate-spin" />
          </div>
        );
      }
      if (error && showError) {
        return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
      }
      
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">Transaction History</h1>

            {/* Back Button */}
            <div className="flex justify-between mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary"
                >
                    Back
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <input
                    type="text"
                    placeholder="Search transactions..."
                    className="input input-bordered w-full sm:w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="select select-bordered w-full sm:w-48"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">All Transactions</option>
                    {Object.keys(groupedCategories).map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                    ))}
                </select>
            </div>

            {/* Transaction List */}
            {loading ? (
                <p className="text-center text-gray-500">Loading transactions...</p>
            ) : filteredTransactions?.length > 0 ? (
                Object.keys(groupedCategories).map((category, index) => {
                    const categoryTransactions = filteredTransactions.filter(tx =>
                        groupedCategories[category]?.includes(tx.transactionType)
                    );

                    return categoryTransactions.length > 0 ? (
                        <div key={index} className="mb-6">
                            <h2 className="text-lg sm:text-xl font-bold text-primary mb-2">{category}</h2>
                            <TransactionList transactions={categoryTransactions} />
                        </div>
                    ) : null;
                })
            ) : (
                <p className="text-center text-gray-500">No transactions found.</p>
            )}
        </div>
    );
};

export default TransactionHistory;
