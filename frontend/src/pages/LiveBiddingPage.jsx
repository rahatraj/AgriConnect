import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchLiveBid, placeBid, updateBidLive, bidClosedUpdate } from "../redux/slices/bidSlice";
import { addNotification } from "../redux/slices/NotificationSlice";
import Leaderboard from "../components/Bidding/Leaderboard";
import BidHistory from "../components/Bidding/BidHistory";
import BiddingStatus from "../components/Bidding/BiddingStatus";
import ProductSummary from "../components/Bidding/ProductSummary";
import CloseBidModal from "../components/common/CloseBidModal";
import WinnerInfo from "../components/Bidding/WinnerInfo";
import toast from "react-hot-toast";
import { getSocket } from "../redux/middlewares/socketMiddleware";
import ErrorComponent from "../components/common/ErrorComponent";
import { Loader } from "lucide-react";

function LiveBiddingPage() {
  const socket = getSocket();
  const { bidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: currentUser } = useSelector((state) => state.users);
  const { selectedBid, error, loading } = useSelector((state) => state.bids);
  const notifications = useSelector((state) => state.notifications.notifications);
  const [bidAmount, setBidAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch bid details and join room
  useEffect(() => {
    if (bidId) {
      dispatch(fetchLiveBid(bidId));
    }
  }, [dispatch, bidId]);

  // Handle room joining/leaving
  useEffect(() => {
    if (!socket || !bidId || !selectedBid) return;
    
    // Join the room
    socket.emit("joinRoom", bidId);
    console.log(`Joined bid room: ${bidId}`);
    
    // Cleanup: leave room when component unmounts
    return () => {
      console.log(`Leaving bid room: ${bidId}`);
      socket.emit("leavingRoom", bidId);
    };
  }, [socket, bidId, selectedBid, currentUser?.user?.role]);

  // Handle bid updates and notifications
  useEffect(() => {
    if (!socket || !selectedBid) return;

    const handleBidUpdate = (updatedBid) => {
      console.log("Received bid update:", updatedBid);
      console.log("Current user role:", currentUser?.user?.role);
      dispatch(updateBidLive(updatedBid));
      dispatch(addNotification({ 
        message: `New bid placed: ₹${updatedBid.currentHighestBid}`,
        type: "success"
      }));
    };

    const handleBidClosed = (closedBid) => {
      console.log("Received bid closed:", closedBid);
      dispatch(bidClosedUpdate(closedBid));
      dispatch(addNotification({ 
        message: "This bid has been closed!",
        type: "info"
      }));
    };

    // Set up event listeners
    socket.on("bidUpdate", handleBidUpdate);
    socket.on("bidClosed", handleBidClosed);
  
    // Cleanup event listeners
    return () => {
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("bidClosed", handleBidClosed);
    };
  }, [dispatch, socket, selectedBid, currentUser?.user?.role]);

  // Handle notifications
  useEffect(() => {
    if (notifications.length > 0) {
      const notification = notifications[0];
      if (notification.type === "success") {
        toast.success(notification.message);
      } else if (notification.type === "info") {
        toast.info(notification.message);
      } else {
        toast.error(notification.message);
      }
    }
  }, [notifications]);

  const handlePlaceBid = async () => {
    const minBid = selectedBid?.currentHighestBid;
    if (!bidAmount || isNaN(bidAmount) || Number(bidAmount) <= minBid) {
      toast.error("Bid must be higher than the current highest bid!");
      return;
    }
    const productId = selectedBid?.product?._id;
    dispatch(placeBid({ bidId, bidAmount, productId }));
    setBidAmount("");
  };

  if (error) {
    return <ErrorComponent message={error}/>;
  }
  if (!selectedBid) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="lg:text-3xl text-lg font-bold text-red-600 flex items-center justify-center gap-2">
        Live Bidding - Real-Time Auction <span className="animate-pulse lg:text-lg">🔴</span>
      </h1>
      <p className="text-gray-800 mt-2 text-sm lg:text-lg lg:text-center">
        Track real-time bidding action, place bids, and see the highest bidders instantly!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 order-2 lg:order-1">
          {selectedBid?.bidStatus === "Close" && selectedBid?.winner && (
            <div className="card bg-success text-white shadow-xl mt-4 p-6">
              <h2 className="lg:text-xl font-bold text-white mb-4">Winner Information</h2>
              <WinnerInfo winner={selectedBid?.winner} winningAmount={selectedBid?.currentHighestBid} />
            </div>
          )}
          <div className="card bg-base-100 shadow-xl mt-4 p-6">
            <h2 className="lg:text-xl font-bold text-secondary mb-4">Bidding Status</h2>
            <BiddingStatus deadline={selectedBid?.biddingDeadLine} />
          </div>
          <div className="card bg-base-100 shadow-xl p-6 lg:mt-10">
            <h2 className="lg:text-xl font-bold text-primary mb-4">Product Information</h2>
            <ProductSummary product={selectedBid?.product} bid={selectedBid} />
          </div>
        </div>
        <div className="lg:col-span-2 order-1 lg:order-2">
          {currentUser?.user?.role === "Buyer" && selectedBid?.bidStatus === "Open" && (
            <div className="mt-6 card bg-base-100 shadow-xl p-6 text-center">
              <h2 className="text-xl font-bold text-secondary">Place Your Bid</h2>
              <input
                type="number"
                placeholder="Enter your bid amount"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="input input-bordered w-full mt-3"
              />
              <button onClick={handlePlaceBid} className="btn btn-primary w-full mt-3">
                Place Bid
              </button>
            </div>
          )}
          <div className="card bg-base-100 shadow-xl p-6 lg:mt-10">
            <h2 className="text-xl font-bold text-accent mb-4">🏆 Live Leaderboard</h2>
            <Leaderboard bidId={selectedBid?._id} />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-bold text-secondary mb-4">Bid History</h2>
        <BidHistory bids={selectedBid?.bidders} bidId={selectedBid?._id} />
      </div>
      <div className="mt-6 flex justify-between">
        <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
        {currentUser?.user?.role === "Farmer" && selectedBid?.bidStatus === "Open" && (
          <button className="btn btn-error" onClick={() => setIsModalOpen(true)}>Close Bid</button>
        )}
        {isModalOpen && (
          <CloseBidModal bidId={selectedBid?._id} isFarmer={currentUser?.user?.role} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default LiveBiddingPage;
