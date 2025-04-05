import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";

// Start a New Bid (Farmer)
export const startBidding = createAsyncThunk(
  "bids/startBidding",
  async ({ productId, bidData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/bids/start/${productId}`, bidData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to start bidding"} );
    }
  }
);

// Place a Bid (Buyer)
export const placeBid = createAsyncThunk(
  "bids/placeBid",
  async ({ bidId, bidAmount,productId }, { rejectWithValue }) => {
    try {
      console.log("product id : ", productId)
      const response = await axiosInstance.post(`/bids/${bidId}/place`, { bidAmount,productId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to place a bid"} );
    }
  }
);

// Ongoing Bids with Filters & Pagination
export const fetchOngoingBids = createAsyncThunk(
  "bids/fetchOngoingBids",
  async ({ page = 1, limit = 10, status,category = "", search = "", sort = "biddingDeadLine" }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/bids/ongoing?page=${page}&limit=${limit}&status=${status}&category=${category}&search=${search}&sort=${sort}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to fetch ongoing bids"} );
    }
  }
);

// Live Bid Details (Individual Bid)
export const fetchLiveBid = createAsyncThunk(
  "bids/fetchLiveBid",
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/bids/${bidId}/details`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to fetch live bid"} );
    }
  }
);

// Close Bid (Farmer)
export const closeBid = createAsyncThunk(
  "bids/closeBid",
  async (bidId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/bids/${bidId}/close`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to close a bid"} );
    }
  }
);

// Fetch All Bids (Ongoing + Closed)
export const fetchAllBids = createAsyncThunk(
  "bids/fetchAllBids",
  async ({ page = 1, limit = 10, status = "", category="",sort="",search=""}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({ page, limit, status, category, sort, search });
      const response = await axiosInstance.get(`/bids/list?${queryParams}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to all bids"} );
    }
  }
);

export const fetchFarmerStats = createAsyncThunk(
  "bids/fetchFarmerStats",
  async(__, { rejectWithValue})=>{
    try {
      const response = await axiosInstance.get("/bids/stats")
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to fetch farmers stats"} );
    }
  }
)

export const fetchBuyerStats = createAsyncThunk(
  "bids/fetchBuyerStats",
  async(__,{rejectWithValue})=> {
    try {
        const response = await axiosInstance.get("/bids/stats/buyer")
        return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to fetch buyer stats"} );
    }
  }
)
export const fetchBiddingHistory = createAsyncThunk(
  "bids/fetchBiddingHistory",
  async({page=1, limit=10, category=""}, {rejectWithValue})=> {
    try {
      const response = await axiosInstance.get(`/bids/myhistory?page=${page}&limit=${limit}&category=${category}`)
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message : "Failed to fetch bidding history"} );
    }
  }
)
const bidSlice = createSlice({
  name: "bids",
  initialState: {
    allBids: [],
    activeBids: [], // List of ongoing bids
    pagination: {}, // Pagination details for ongoing bids
    allBidsPagination: {}, // Store pagination for all bids
    selectedBid: null, // Current bid details
    highestBid: 0, // Current highest bid (real-time)
    bidders: [], // List of bidders

    // Farmer Dashboard Stats
    farmerStats: {
      totalActiveBids: 0,
      totalCompletedBids: 0,
      totalEarnings: 0,
      walletBalance: 0,
      recentBids: [],
      recentTransactions: [],
      earningsHistory : []
    },

    // buyer Dashboard stats
    buyerStats : {
      totalActiveBids : 0,
      wonBids : 0,
      recentBids : [],
      recentTransactions : [],
      walletBalance : 0
    },
    biddingHistory : null,
    loading: false,
    error: null,
  },
  reducers: {
    // Add new reducer for new bids
    addNewBid: (state, action) => {
      const newBid = action.payload;
      state.allBids.unshift(newBid); // Add to beginning of array
      state.activeBids.unshift(newBid); // Add to active bids
      state.allBidsPagination.totalItems += 1; // Update pagination count
    },
    
    // Real-Time Bid Updates from Socket.io
    updateBidLive: (state, action) => {
      const updatedBid = action.payload;
    
      // Update selectedBid if it's the same as the updated bid
      if (state.selectedBid && state.selectedBid._id === updatedBid.bidId) {
        state.selectedBid.currentHighestBid = updatedBid.currentHighestBid;
        state.selectedBid.bidders = updatedBid.bidders;
        state.highestBid = updatedBid.currentHighestBid;
      }
    
      // Update in allBids if found
      state.allBids = state.allBids.map((bid) =>
        bid._id === updatedBid.bidId ? { ...bid, currentHighestBid: updatedBid.currentHighestBid,bidders: updatedBid.bidders } : bid
      );
    
      // Update in activeBids if found
      state.activeBids = state.activeBids.map((bid) =>
        bid._id === updatedBid.bidId ? { ...bid, currentHighestBid: updatedBid.currentHighestBid, bidders : updatedBid.bidders } : bid
      );

      // total active bids
      state.farmerStats.totalActiveBids = state.activeBids.filter((bid) => bid.bidStatus === "Open").length;
    },
    
    bidClosedUpdate: (state, action) => {
      const closedBid = action.payload;

        // Update selectedBid if it was closed
      if (state.selectedBid && state.selectedBid._id === closedBid.bidId) {
        state.selectedBid.bidStatus = "Close";
        state.selectedBid.winner = closedBid.winner;
      }
    
      // Remove from active bids
      state.activeBids = state.activeBids.filter((bid) => bid._id !== closedBid.bidId);
    
      // completed bids count
      state.farmerStats.totalCompletedBids += 1;
    
      if (closedBid.winner) {
        state.farmerStats.totalEarnings += closedBid.winningAmount;
      }

        // Update allBids
      state.allBids = state.allBids.map((bid) =>
        bid._id === closedBid.bidId ? { ...bid, bidStatus: "Close", winner: closedBid.winner } : bid
      );


    },

    // farmer stats
    updateFarmerStats: (state, action) => {
      state.farmerStats = {
        ...state.farmerStats,
        totalActiveBids: action.payload.totalActiveBids,
        totalCompletedBids: action.payload.totalCompletedBids,
        totalEarnings: action.payload.totalEarnings,
        walletBalance: action.payload.walletBalance,
        recentBids: action.payload.recentBids,
        earningsHistory: action.payload.earningsHistory,
      };
    },

    // buyer stats
    updateBuyerStats: (state, action) => {
      state.buyerStats = {
        ...state.buyerStats,
        totalActiveBids : action.payload.totalActiveBids,
        wonBids: action.payload.wonBids,
        recentBids: action.payload.recentBids,
        walletBalance: action.payload.walletBalance,
        recommendedBids : action.payload.recommendedBids
      };
    },

  },
  extraReducers: (builder) => {
    builder
      // Start a Bid
      .addCase(startBidding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startBidding.fulfilled, (state, action) => {
        state.activeBids.push(action.payload.bid);
        state.loading = false;
        state.error = null;
      })
      .addCase(startBidding.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Place a Bid
      .addCase(placeBid.pending, (state) => {
        state.loading = true;
        state.error = null; 
      })
      .addCase(placeBid.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Update the bid in allBids and activeBids
        const updatedBid = action.payload.bid;
        state.allBids = state.allBids.map(bid => 
          bid._id === updatedBid._id ? updatedBid : bid
        );
        state.activeBids = state.activeBids.map(bid => 
          bid._id === updatedBid._id ? updatedBid : bid
        );
        // Update selectedBid if it's the same bid
        if (state.selectedBid?._id === updatedBid._id) {
          state.selectedBid = updatedBid;
        }
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Store the error message
      })

      // Fetch Ongoing Bids
      .addCase(fetchOngoingBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOngoingBids.fulfilled, (state, action) => {
        state.activeBids = action.payload.bids;
        state.pagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchOngoingBids.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch All Bids
      .addCase(fetchAllBids.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllBids.fulfilled, (state, action) => {
        state.allBids = action.payload.bids;
        state.allBidsPagination = action.payload.pagination;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchAllBids.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch Live Bid
      .addCase(fetchLiveBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLiveBid.fulfilled, (state, action) => {
        state.selectedBid = action.payload.bid;
        state.highestBid = action.payload.bid.currentHighestBid;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchLiveBid.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Close Bid
      .addCase(closeBid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(closeBid.fulfilled, (state, action) => {
        const { bidId } = action.payload;
        state.activeBids = state.activeBids.filter(bid => bid._id !== bidId);
        if (state.selectedBid?._id === bidId) {
          state.selectedBid.bidStatus = "Close";
          state.selectedBid.winner = action.payload.winner;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(closeBid.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch Farmer Stats
      .addCase(fetchFarmerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmerStats.fulfilled, (state, action) => {
        state.farmerStats = {
          ...state.farmerStats,
          ...action.payload
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchFarmerStats.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch Buyer Stats
      .addCase(fetchBuyerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBuyerStats.fulfilled, (state, action) => {
        state.buyerStats = {
          ...state.buyerStats,
          ...action.payload
        };
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBuyerStats.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })

      // Fetch Bidding History
      .addCase(fetchBiddingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBiddingHistory.fulfilled, (state, action) => {
        state.biddingHistory = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchBiddingHistory.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { updateBidLive, bidClosedUpdate, updateFarmerStats, updateBuyerStats, addNewBid } = bidSlice.actions;
export default bidSlice.reducer;
