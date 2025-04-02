import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { startBidding } from "../../redux/slices/bidSlice";
import { getSocket } from "../../redux/middlewares/socketMiddleware";

const formInitial = {
  basePrice: "",
  biddingDeadLine: "",
  quantity: "",
};

function StartBiddingForm() {
  const socket = getSocket()
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [bidData, setBidData] = useState(formInitial);
  const [countdown, setCountdown] = useState("");

  // Countdown Timer
  useEffect(() => {
    if (bidData.biddingDeadLine) {
      const interval = setInterval(() => {
        const now = new Date();
        const targetTime = new Date(bidData.biddingDeadLine);
        const timeLeft = targetTime - now;
        if (timeLeft > 0) {
          const hours = Math.floor(timeLeft / 3600000);
          const minutes = Math.floor((timeLeft % 3600000) / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          setCountdown(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setCountdown("Expired");
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [bidData.biddingDeadLine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBidData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clientValidations = () => {
    if (!bidData.basePrice || bidData.basePrice < 1) {
        toast.error("Please enter a valid base price.");
        return false;
      }
      if (!bidData.quantity || bidData.quantity < 5) {
        toast.error("Product weight must be at least 5kg.");
        return false;
      }
      if (!bidData.biddingDeadLine || new Date(bidData.biddingDeadLine) <= new Date()) {
        toast.error("Please select a future date and time.");
        return false;
      }
      return true;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(!clientValidations()) return;

    const result = await dispatch(startBidding({productId,bidData}));
    if (result.meta.requestStatus === "fulfilled") {
      toast.success("Bidding started successfully.");
      
      if(socket){
        socket.emit("notification",{
          message : `New bidding started for ${result?.payload?.bid?.product?.productName}`,
          notificationtype : "Bidding"
        })
      }
      navigate("/ongoing-bids");
      setBidData(formInitial);
    } else {
      toast.error("Failed to start bidding. Please try again.");
    }
  };

  return (
    <div className="min-h-screen mt-0 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-center">Start Bidding</h2>

        {/* Countdown Timer */}
        {bidData.biddingDeadLine && (
          <p className="text-red-500 text-center mb-3">Bidding Ends in: {countdown}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold">Product Base Price</label>
            <input
              type="number"
              name="basePrice"
              value={bidData.basePrice}
              onChange={handleChange}
              className="w-full p-2 input input-bordered rounded mt-1"
              placeholder="Enter base price"
            />
          </div>

          <div>
            <label className="block font-semibold">Product Weight (kg)</label>
            <input
              type="number"
              name="quantity"
              value={bidData.quantity}
              onChange={handleChange}
              className="w-full p-2 input input-bordered rounded mt-1"
              placeholder="Enter weight"
            />
          </div>

          <div>
            <label className="block font-semibold">Bid Deadline</label>
            <input
              type="datetime-local"
              name="biddingDeadLine"
              value={bidData.biddingDeadLine}
              onChange={handleChange}
              className="w-full p-2 input input-bordered rounded mt-1"
            />
          </div>

          <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded w-full hover:bg-green-700">
            Start Bidding
          </button>
        </form>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mt-3 w-full text-gray-600 hover:text-gray-900"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}

export default StartBiddingForm;
