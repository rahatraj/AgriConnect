import React, { useEffect, useState } from "react";
import moment from "moment";
import { useSelector } from "react-redux";

function BidHistory({ bidId }) {
  const bidHistoryFromRedux = useSelector((state) =>
    state?.bids?.selectedBid?.bidders || []
  );
  const [bidHistory, setBidHistory] = useState(bidHistoryFromRedux);

  // Update bid history when Redux state changes
  useEffect(() => {
    setBidHistory(bidHistoryFromRedux);
  }, [bidHistoryFromRedux]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-4 border">
      <h2 className="text-lg font-bold text-gray-900">📜 Bid History</h2>

      {bidHistory?.length === 0 ? (
        <p className="text-gray-500 mt-2">No bids placed yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {[...bidHistory]
            .sort((a, b) => b.bidAmount - a.bidAmount) // Sort bids in descending order
            .map((bid, index) => (
              <li
                key={bid?._id}
                className={`p-3 rounded-md border flex justify-between items-center ${
                  index === 0
                    ? "bg-green-100 border-green-500"
                    : index === 1
                    ? "bg-blue-100 border-blue-500"
                    : index === 2
                    ? "bg-yellow-100 border-yellow-500"
                    : "border-gray-300"
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {bid?.buyer?.fullName} {index === 0 && "🥇"}{" "}
                    {index === 1 && "🥈"} {index === 2 && "🥉"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {moment(new Date(bid?.bidTime)).format(
                      "MMMM Do YYYY, h:mm:ss A"
                    )}
                  </p>
                </div>
                <p className="lg:text-lg font-bold text-gray-900">
                  ₹{bid?.bidAmount}
                </p>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export default BidHistory;
