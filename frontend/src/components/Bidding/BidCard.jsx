import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";

function BidCard({ bid }) {
  const { data: currentUser } = useSelector((state) => state.users);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const deadline = moment(bid.biddingDeadLine);
      const now = moment();
      const diff = moment.duration(deadline.diff(now));

      if (diff.asSeconds() > 0) {
        setTimeLeft(
          `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m ${diff.seconds()}s`
        );
      } else {
        setTimeLeft("Bidding Closed");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [bid.biddingDeadLine]);

  return (
    <div className="card bg-white shadow-md p-4 rounded-lg overflow-hidden hover:scale-105 transition duration-200">
      {/* Product Image */}
      <div className="h-48 flex justify-center items-center bg-gray-100">
        {bid?.product?.productImages?.length > 0 ? (
          <img
            src={bid.product.productImages[0]?.url || null}
            alt={bid.product.productName}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <p className="text-gray-500">No Image Available</p>
        )}
      </div>

      {/* Product & Bid Details */}
      <div className="p-2">
        <h2 className="text-lg font-bold">{bid?.product?.productName}</h2>
        <p className="text-gray-700 text-sm">{bid?.product?.productDescription}</p>

        <div className="flex flex-wrap items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">{bid?.product?.category}</p>
            <p className={`text-sm font-bold ${timeLeft === "Bidding Closed" ? "text-red-500" : "text-red-600"}`}>
              {bid?.bidStatus === "Close" ? `Bid Status : ${bid?.bidStatus}` : `Bid Ends : ${timeLeft}`}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">
              Base Price: <span className="font-bold text-gray-900">₹{bid?.basePrice}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Weight : <span className="font-semibold text-gray-900">{bid?.quantity}Kg</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between gap-2 mt-2">
          <Link to={`/bid-details/${bid._id}`} className="btn btn-info sm:w-auto">
            View Details
          </Link>
          {currentUser?.user?.role === "Farmer" ? (
            <Link to={`/bid/check-live/${bid._id}`} className="btn btn-primary sm:w-auto">
              Check Live Bid
            </Link>
          ) : (
            <Link to={`/bid/check-live/${bid._id}`} className="btn btn-primary sm:w-auto">
              Bid Now
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default BidCard;
