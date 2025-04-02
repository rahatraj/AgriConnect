import React from "react";
import { useNavigate } from "react-router-dom";

function WalletActions() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            <button className="btn btn-primary w-full sm:w-auto" onClick={() => navigate("/wallet/add-funds")}>
                Add Funds
            </button>
            <button className="btn btn-warning w-full sm:w-auto">
                Withdraw Funds
            </button>
            <button className="btn btn-secondary w-full sm:w-auto" onClick={() => navigate("/wallet/fundtransfer")}>
                Transfer Funds
            </button>
            <button className="btn btn-info w-full sm:w-auto" onClick={() => navigate("/wallet/getfullhistory")}>
                Get Full History
            </button>
        </div>
    );
}

export default WalletActions;
