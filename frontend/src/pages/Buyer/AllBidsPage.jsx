import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBids, updateBidLive } from "../../redux/slices/bidSlice"; // ✅ Import updateBidLive
import BidFilters from "../../components/Bidding/BidFilters";
import PaginationControls from "../../components/Bidding/PaginationControls";
import BidCard from "../../components/Bidding/BidCard";
import { debounce } from "lodash";
import { Loader, Search } from "lucide-react";
import { getSocket } from "../../redux/middlewares/socketMiddleware";
import NoBidsFound from "../../components/Bidding/NoBidsFound";
import ErrorComponent from "../../components/common/ErrorComponent";

function AllBidsPage() {
  const socket = getSocket()
  const dispatch = useDispatch();
  const { allBids, allBidsPagination, loading, error } = useSelector((state) => state.bids);

  // State for filters, search, sorting, and pagination
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);

  const handleSearch = debounce((value) => {
    setSearch(value);
    setPage(1);
  }, 500);

  // Fetch Bids function
  useEffect(() => {
    dispatch(fetchAllBids({ page, status, category, sort, search }));
  }, [dispatch, page, status, category, sort, search]);

  // Listen for Real-Time Bid Updates
  useEffect(() => {
    if (socket) {
      socket.on("bidUpdate", (bidData) => {
        dispatch(updateBidLive(bidData));
      });

      return () => {
        socket.off("bidUpdate");
      };
    }
  }, [socket, dispatch]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  if (error) {
    return <ErrorComponent message={error}/>;
  }
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">🌾 Live Bidding Marketplace</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Explore ongoing bids, place your best offer, and win high-quality farm products!
         </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="input input-bordered w-full pl-10"
            placeholder="Search bids..."
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <BidFilters status={status} setStatus={setStatus} />
        <select
          className="select select-bordered"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort by Price</option>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>

        <select className="select select-bordered" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Grains">Grains</option>
          <option value="Fruits">Fruits</option>
          <option value="Vegetables">Vegetables</option>
        </select>
      </div>

      {/* Bids List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading bids...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {allBids?.length > 0 ? (
            allBids.map((bid) => <BidCard key={bid._id} bid={bid} />)
          ) : (
            <NoBidsFound 
              heading={`No Bids Founds`}
              message={`No bids found in this category. Try exploring more listings and place your bids to start winning!`}
            />
          )}
        </div>
      )}

      {/* Pagination */}
      <PaginationControls page={page} setPage={setPage} totalPages={allBidsPagination.totalPages || 1} />
    </div>
  );
}

export default AllBidsPage;
