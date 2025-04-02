import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getWalletDetails, addFunds, verifyPayment } from "../../redux/slices/walletSlice";

function AddFundsPage() {
    const socket = useSelector((state) => state.socket.instance);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { wallet } = useSelector((state) => state.wallet);
    const { data : currentUser } = useSelector((state)=> state.users)

    useEffect(() => {
        dispatch(getWalletDetails());
        if (socket) {
            socket.on("wallet_update", () => {
                dispatch(getWalletDetails());
            });
        }
        return () => {
            if (socket) socket.off("wallet_update");
        };
    }, [dispatch, socket]);

    // Load Razorpay script dynamically
    const loadRazorpayScript = async () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!amount || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
            toast.error("Razorpay SDK failed to load!");
            return;
        }
        setLoading(true);
        try {
            const resultAction = await dispatch(addFunds(amount));
            if (addFunds.fulfilled.match(resultAction)) {
                const { order } = resultAction.payload;
                setAmount("")
                const options = {
                    key: import.meta.env.VITE_RAZORPAY_KEY,
                    amount: order.amount,
                    currency: "INR",
                    name: "AgriConnect",
                    description: "Wallet Recharge",
                    order_id: order.id,
                    handler: async function (response) {
                        toast.success("Payment successful! Verifying...");
                        console.log("Razorpay Response:", response);
                        
                        // Verify payment with the backend
                        const verifyData = await dispatch(verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount,
                        }));
                        if (verifyData.success) {
                            toast.success("Wallet updated successfully!");
                            dispatch(getWalletDetails());
                        }
                    },
                    prefill: {
                        name: currentUser?.user?.fullName || "User",
                        email: currentUser?.user?.email || "user@example.com",
                        contact: currentUser?.user?.contactNumber||"9999999999",
                    },
                    theme: {
                        color: "#4CAF50",
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            } else {
                toast.error(resultAction.payload || "Payment failed!");
            }
        } catch (error) {
            toast.error("Error processing payment");
            console.error("Payment Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
            <div className="card bg-white shadow-xl p-6 max-w-md w-full rounded-2xl">
                <h1 className="text-2xl font-bold text-center text-primary">Add Funds</h1>

                {/* Wallet Balance */}
                <p className="text-center text-neutral mt-2">
                    Current Balance:{" "}
                    <span className="font-bold text-success">
                        ₹{wallet?.balance?.toFixed(2) || "0.00"}
                    </span>
                </p>

                {/* Input Amount */}
                <div className="mt-4">
                    <label className="block text-neutral font-medium">Enter Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input input-bordered w-full mt-2"
                        placeholder="Enter amount (e.g. 500)"
                    />
                </div>

                {/* Payment Button */}
                <button
                    onClick={handlePayment}
                    className={`btn btn-primary w-full mt-4 ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Proceed to Pay"}
                </button>

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-secondary w-full mt-2"
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default AddFundsPage;
