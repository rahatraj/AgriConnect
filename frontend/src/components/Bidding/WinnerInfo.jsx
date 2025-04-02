import React from "react";
import moment from "moment";
import { Trophy } from "lucide-react";

function WinnerInfo({ winner, winningAmount}) {
  if (!winner) return null;

  return (
    <div className="card bg-yellow-100 shadow-md border border-yellow-500 p-5 rounded-xl">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Winner Trophy Icon */}
        <div className="flex items-center justify-center bg-yellow-500 text-white rounded-full p-3 w-14 h-14">
          <Trophy size={28} />
        </div>

        {/* Winner Details */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-yellow-800 flex items-center gap-2">
            🏆 {winner?.fullName} is the Winner!
          </h2>

          <p className="text-lg sm:text-xl font-semibold text-green-700 mt-1">
            Winning Bid: ₹{winningAmount}
          </p>
        </div>
      </div>
    </div>
  );
}

export default WinnerInfo;
