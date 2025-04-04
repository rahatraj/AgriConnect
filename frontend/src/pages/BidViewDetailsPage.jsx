import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import BiddingStatus from "../components/Bidding/BiddingStatus";
import BidHistory from "../components/Bidding/BidHistory";
import WinnerInfo from "../components/Bidding/WinnerInfo";
import ActionButtons from "../components/Bidding/ActionButtons";
import ProductDetails from "../components/Bidding/ProductDetails";
import ProductLocation from "../components/Bidding/ProductLocation";
import { bidClosedUpdate, fetchLiveBid, updateBidLive } from "../redux/slices/bidSlice";
import { getSocket } from "../redux/middlewares/socketMiddleware";
import toast from "react-hot-toast";

function BidViewDetailsPage() {
  const { bidId } = useParams();
  const dispatch = useDispatch();
  const { data: currentUser } = useSelector((state) => state.users);
  const { selectedBid } = useSelector((state) => state.bids);
  const notifications = useSelector((state) => state.notifications.notifications);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    
    dispatch(fetchLiveBid(bidId));

    // Listen for bid updates without joining the room
    socket.on("bidUpdate", (updatedBid) => {
      console.log("Received bidUpdate:", updatedBid);
      dispatch(updateBidLive(updatedBid));
    });

    socket.on("bidClosed", (closedBid) => {
      console.log("Bid closed:", closedBid);
      dispatch(bidClosedUpdate(closedBid));
    });

    return () => {
      socket.off("bidUpdate");
      socket.off("bidClosed");
    };
  }, [dispatch, bidId]);

  // Handle notifications
  useEffect(() => {
    if (notifications.length > 0) {
      toast.success(notifications[0].message);
    }
  }, [notifications]);

  if (!selectedBid) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="lg:text-3xl text-2xl font-bold text-primary">Bid Details & Live Updates</h1>
        <p className="text-gray-800 mt-2 text-sm lg:text-lg">
          View complete details of this bid, track real-time updates, and take necessary actions.
          Stay updated with the <span className="font-semibold text-primary">highest bid</span>,
          <span className="font-semibold text-secondary"> bidding status</span>, and
          <span className="font-semibold text-accent"> bid history</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Product Information</h2>
            <ProductDetails product={selectedBid?.product} bid={selectedBid} />
          </div>

          <div className="card bg-base-100 shadow-xl mt-4 p-6">
            <h2 className="text-xl font-bold text-secondary mb-4">Bidding Status</h2>
            {selectedBid && <BiddingStatus deadline={selectedBid?.biddingDeadLine} />}
          </div>

          {currentUser?.user?.role === "Buyer" && selectedBid?.bidStatus === "Close" && (
            <div className="card bg-base-100 shadow-xl mt-4 p-6">
              <h2 className="text-xl font-semibold text-info mb-4">Farm Location</h2>
              <ProductLocation geoCoordinates={selectedBid?.product?.geoCoordinates} 
                bidStatus={selectedBid?.bidStatus} 
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-xl p-6">
            {selectedBid?.winner && (
              <div className="card bg-success text-white shadow-xl mt-4 p-6">
                <h2 className="text-xl font-semibold">Winner Information</h2>
                <WinnerInfo winner={selectedBid?.winner} winningAmount={selectedBid?.currentHighestBid} />
              </div>
            )}
            <h2 className="text-xl font-bold text-accent mb-4">Bid History</h2>
            <BidHistory bids={selectedBid?.bidders} bidId={selectedBid?._id} />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <ActionButtons bid={selectedBid} currentUser={currentUser} />
      </div>
    </div>
  );
}

export default BidViewDetailsPage;