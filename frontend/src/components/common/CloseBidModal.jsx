import React, { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { getSocket } from "../../redux/middlewares/socketMiddleware";
import { closeBid } from "../../redux/slices/bidSlice";

function CloseBidModal({ bidId, isOpen, onClose, isFarmer }) {
  const socket = getSocket();
  const dispatch = useDispatch();
  const [closing, setClosing] = useState(false);

  const handleCloseBid = async () => {
    if (!isFarmer) {
      toast.error("Only farmers can close the bid!");
      return;
    }

    setClosing(true);
    try {
      const result = await dispatch(closeBid(bidId)).unwrap();

      if (result.success) {
        const winnerMessage = result.winner
          ? `Winner: ${result.winner.name} with ₹${result.winner.amount}`
          : "No bids were placed. The product is still available.";

        toast.success(`Bid closed successfully! ${winnerMessage}`);

        if (socket?.connected) {
          socket.emit("notification", {
            message: `Bidding closed! ${winnerMessage}`,
            notificationType: "Bidding",
          });

          socket.emit("leaveRoom", { bidId });
        }

        onClose();
      } else {
        toast.error(result.message || "Failed to close bid.");
      }
    } catch (error) {
      toast.error("Failed to close bid. Please try again.");
    }
    setClosing(false);
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${isOpen ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <div className="bg-white rounded-lg p-6 shadow-lg w-80">
        <h2 className="text-lg font-semibold text-gray-900">Confirm Close the Bid</h2>
        <p className="text-gray-600 mt-2">
          Are you sure you want to close the bid? This action cannot be undone.
        </p>
        <div className="flex justify-end mt-4 space-x-2">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-error" onClick={handleCloseBid} disabled={closing}>
            {closing ? "Closing..." : "Close Bid"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CloseBidModal;
