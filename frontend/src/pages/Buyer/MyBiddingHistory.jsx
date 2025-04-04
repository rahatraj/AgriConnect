import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBiddingHistory } from "../../redux/slices/bidSlice";
import BidCard from "../../components/Bidding/BidCard";
import PaginationControls from "../../components/Bidding/PaginationControls";
import NoBidsFound from "../../components/Bidding/NoBidsFound";
import { Loader } from "lucide-react";
import ErrorComponent from "../../components/common/ErrorComponent";

function MyBiddingHistory() {
  const dispatch = useDispatch();
  const { biddingHistory, loading, error } = useSelector((state) => state.bids);
  const [showError, setShowError] = useState(true);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("activeBids");

  useEffect(() => {
    dispatch(fetchBiddingHistory({ page, category }));
  }, [dispatch, page, category]);

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
    <div className="p-6 min-h-screen bg-base-100">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-3xl font-extrabold text-primary"> My Bidding History</h2>
        <p className="md:text-lg text-gray-600 mt-2">
          Track all your bidding activity, including ongoing, won, and lost bids.
        </p>
      </div>

      {/* Category Selector */}
      <div className="flex justify-center mb-6">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="select select-bordered w-60 md:text-md font-semibold bg-white border-primary"
        >
          <option value="activeBids"> Active Bids</option>
          <option value="wonBids">Won Bids</option>
          <option value="lostBids"> Lost Bids</option>
        </select>
      </div>

      {/* Loading & Error Handling */}
      {loading && <p className="text-center text-lg text-info">Fetching your bids...</p>}
      {error && <p className="text-center text-lg text-error">{error}</p>}

      {/* Bidding Cards */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {biddingHistory?.data?.length > 0 ? (
            biddingHistory?.data?.map((bid) => <BidCard key={bid._id} bid={bid} />)
          ) : (
              <NoBidsFound heading={`No Bids Found`} message={`Looks like you haven't placed any bids in this category yet.`}/>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="mt-8 flex justify-center">
        <PaginationControls page={page} setPage={setPage} totalPages={biddingHistory?.totalPages} />
      </div>
    </div>
  );
}

export default MyBiddingHistory;
