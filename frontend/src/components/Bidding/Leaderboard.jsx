import React, { useMemo } from "react";
import { Medal } from "lucide-react";
import moment from "moment";
import { useSelector } from "react-redux";

function Leaderboard({ bidId }) {
  // Memoize the leaderboard data to prevent unnecessary re-renders
  const bidLeaderboard = useSelector((state) => state.bids.selectedBid);

  const sortedBidders = useMemo(() => {
    if (!bidLeaderboard || bidLeaderboard._id !== bidId || !bidLeaderboard.bidders) return [];

    return [...bidLeaderboard.bidders]
      .sort((a, b) => b.bidAmount - a.bidAmount)
      .slice(0, 5);
  }, [bidLeaderboard, bidId]);

  if (!sortedBidders?.length) {
    return (
      <div className="text-center p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">🏆 Live Leaderboard</h2>
        <p className="text-gray-500">No bids placed yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-base-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-lg font-bold text-center">🏆 Live Leaderboard</h2>
      <div className="space-y-3">
        {sortedBidders?.map((bidder, index) => (
          <div
            key={bidder?._id || index}
            className={`flex justify-between items-center p-3 rounded-lg shadow-md 
              ${index === 0 ? "bg-yellow-100 border border-yellow-500" : ""}
              ${index === 1 ? "bg-gray-100 border border-gray-400" : ""}
              ${index === 2 ? "bg-orange-100 border border-orange-500" : ""}
            `}
          >
            <div className="flex items-center gap-2">
              {index === 0 && <Medal className="text-yellow-500" size={20} />}
              {index === 1 && <Medal className="text-gray-500" size={20} />}
              {index === 2 && <Medal className="text-orange-500" size={20} />}
              <p className="text-sm font-semibold">
                {bidder?.buyer?.fullName || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500">
                {bidder?.bidTime
                  ? moment(bidder?.bidTime).format("MMMM Do YYYY, h:mm:ss A")
                  : "Time not available"}
              </p>
            </div>
            <p className="text-lg font-bold text-primary">
              ₹{bidder?.bidAmount || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;
