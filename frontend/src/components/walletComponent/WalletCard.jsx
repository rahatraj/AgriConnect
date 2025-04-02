import React from "react";

function WalletCard({ balance }) {
    return (
        <div className="card bg-green-100 p-4 sm:p-6 shadow-lg text-center rounded-lg">
            <h2 className="text-lg sm:text-2xl font-semibold text-green-900">
                Current Balance
            </h2>
            <p className="text-xl sm:text-3xl font-bold text-green-700 mt-2">
                ₹{balance?.toFixed(2) || "0.00"}
            </p>
        </div>
    );
}

export default WalletCard;
