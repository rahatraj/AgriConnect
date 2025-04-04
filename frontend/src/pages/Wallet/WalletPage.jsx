import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import useSocket from "../../hooks/useSocket";
import { getWalletDetails } from "../../redux/slices/walletSlice";
import WalletCard from "../../components/walletComponent/WalletCard";
import WalletActions from "../../components/walletComponent/WalletActions";
import TransactionList from "../../components/walletComponent/TransactionList";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import ErrorComponent from "../../components/common/ErrorComponent";

function WalletPage() {
    const socket = useSelector((state) => state.socket.instance);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const { wallet, loading, error } = useSelector((state) => state.wallet)
    const [showError, setShowError] = useState(true);

    useEffect(() => {
        dispatch(getWalletDetails());
        if (socket) {
            socket.on("wallet_update", () => {
                dispatch(getWalletDetails());
            });

            socket.on("notification", (data) => {
                console.log("New Notification:", data);
            });
        }

        return () => {
            if (socket) {
                socket.off("wallet_update");
                socket.off("notification");
            }
        };
    }, [dispatch, socket]);

    if (loading) {
        return (
          <div className="flex items-center justify-center h-screen">
            <Loader className="size-10 animate-spin" />
          </div>
        );
      }
      if (error === "WALLET_NOT_CREATED") {
        return (
          <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <p className="text-xl text-gray-700 font-semibold">
                You haven't created a wallet yet.
            </p>
            <p className="text-md text-gray-500 max-w-sm">
                Please update your profile to automatically create your wallet and start managing your transactions.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/profile/update")} // or any logic to trigger wallet creation
            >
              Go to Profile
            </button>
          </div>
        );
    }
    if (error && showError) {
        return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
    }
    return (
        <div className="min-h-screen p-4 sm:p-6 bg-base-100">
            <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
                
                <h1 className="text-xl sm:text-3xl font-bold text-center text-green-900">
                    My Wallet
                </h1>

                {/* Show loading state */}
                {loading ? (
                    <p className="text-center text-gray-500">Loading...</p>
                ) : (
                    <>
                        {/* Wallet Card - Shows Balance */}
                        <WalletCard balance={wallet?.balance} />

                        {/* Wallet Actions  */}
                        <WalletActions />

                        {/* Transaction History */}
                        <TransactionList transactions={wallet?.transactions} />
                    </>
                )}
                {/* Back Button - Responsive & Styled */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-neutral w-full sm:w-auto mx-auto"
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default WalletPage;
