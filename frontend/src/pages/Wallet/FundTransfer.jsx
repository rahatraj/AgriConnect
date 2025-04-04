import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { transferFunds } from "../../redux/slices/walletSlice";
import toast from "react-hot-toast";
import { Input, Button, Card } from "react-daisyui";
import { Loader } from "lucide-react";
import ErrorComponent from "../../components/common/ErrorComponent";

const formInitial = {
    mobileNo : "",
    amount : ""
}
const FundTransfer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success } = useSelector((state) => state.wallet);
  const [showError, setShowError] = useState(true);
  
  const [formData, setFormData] = useState(formInitial)

  // Handle fund transfer
  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!formData.mobileNo || !formData.amount || formData.amount <= 0) {
      toast.error("Please enter a valid mobile number and amount.");
      return;
    }
    console.log("fundTransfer page ", formData)
     await dispatch(transferFunds(formData));
     setFormData(formInitial)
  };

  // Redirect to Wallet Page after successful transfer
  useEffect(() => {
    if (success) {
      toast.success("Transfer successful! Redirecting...");
      setTimeout(() => {
        navigate("/wallet"); // Redirect to Wallet Page
      }, 1500);
    }
  }, [success, navigate]);

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
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-100">
      <Card className="w-full max-w-md sm:max-w-lg bg-base-200 shadow-xl p-6 rounded-xl">
        <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 text-primary">Transfer Funds</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {success && <p className="text-green-500 text-sm text-center">Transfer successful! Redirecting...</p>}

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="label text-sm">Receiver's Mobile Number</label>
            <Input 
              type="tel"
              pattern="[0-9]{10}"
              maxLength="10"
              value={formData.mobileNo}
              onChange={(e) => {setFormData({...formData, mobileNo : e.target.value})}}
              placeholder="Enter 10-digit mobile number"
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="label text-sm">Amount</label>
            <Input 
              type="number"
              min="1"
              value={formData.amount}
              onChange={(e) => {setFormData({...formData, amount : e.target.value})}}
              placeholder="Enter amount (₹)"
              className="input input-bordered w-full"
              required
            />
          </div>

          <Button 
            type="submit"
            className="btn btn-primary w-full flex items-center justify-center"
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : "Send Money"}
          </Button>

          {/* Back Button */}
          <Button
            type="button"
            className="btn btn-secondary w-full"
            onClick={() => navigate("/wallet")}
          >
            Back to Wallet
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default FundTransfer;
