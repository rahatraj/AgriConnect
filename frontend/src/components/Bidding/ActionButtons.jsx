import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CloseBidModal from "../common/CloseBidModal";

const ActionButtons = ({ bid }) => {
    const navigate = useNavigate();
    const { data : currentUser } = useSelector((state) => state.users);
    
    const isFarmer = currentUser?.user?.role === "Farmer";
    const isBuyer = currentUser?.user?.role === "Buyer";
    const isBidOpen = bid?.bidStatus === "Open";
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleBidNow = () => {
        if (!isBuyer) {
            toast.error("Only buyers can place bids!");
            return;
        }
        navigate(`/bid/check-live/${bid?._id}`)
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            <button onClick={() => navigate(-1)} className="btn btn-secondary">
                Back to Bids
            </button>
            {isBuyer && isBidOpen && (
                <button
                    onClick={handleBidNow}
                    className="btn btn-primary"
                >
                    Bid Now
                </button>
            )}

            {isFarmer && isBidOpen && (
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-error sm:w-auto"
                >
                    Close Bid
                </button>
            )}
            {isModalOpen && (
                <CloseBidModal 
                    bidId={bid?._id}
                    isFarmer={isFarmer}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default ActionButtons;
