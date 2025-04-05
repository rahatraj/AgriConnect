import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";
import toast from "react-hot-toast";

// Fetch Wallet Details
export const getWalletDetails = createAsyncThunk(
  "wallet/getWalletDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/wallets/details");
      return response.data;
    } catch (error) {
      console.log(error)
      if (error?.status === 404) {
        // Wallet not created
        return rejectWithValue("WALLET_NOT_CREATED");
      }
      return rejectWithValue(error?.response?.data || {message : "Failed to fetch wallet details"});
    }
  }
);

// Fetch Transaction History
export const getTransactionHistory = createAsyncThunk(
  "wallet/getTransactionHistory",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/wallets/transactions/history");
      console.log(response.data)
      return response.data.transaction;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {message : "Failed to fetch transactions"});
    }
  }
);

// Add Funds
export const addFunds = createAsyncThunk(
  "wallet/addFunds",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/wallets/add-funds", { amount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {message : "Failed to add funds"});
    }
  }
);
export const verifyPayment = createAsyncThunk(
    "wallet/verifyPayment",
    async (paymentData, { rejectWithValue }) => {
      try {
        const response = await axiosInstance.post("/wallets/verify-payment", paymentData);
        return response.data;
      } catch (error) {
        return rejectWithValue(error?.response?.data || {message : "Payment verification failed"});
      }
    }
  );
// Withdraw Funds 
export const withdrawFunds = createAsyncThunk(
  "wallet/withdrawFunds",
  async (amount, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/wallets/withdraw", { amount });
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || {message : "Failed to withdraw funds"});
    }
  }
);

// transfer funds
export const transferFunds = createAsyncThunk(
  "wallet/transferFunds",
  async(formData, {rejectWithValue})=> {
    try {
      console.log(formData)
      const response = await axiosInstance.post("/wallets/transfer", formData)
      console.log(response.data)
    } catch (error) {
      return rejectWithValue(error?.response?.data || {message : "Failed to transafer funds"});
    }
  }
)

const walletSlice = createSlice({
  name: "wallet",
  initialState: {
    wallet : null,
    transactions: [],
    loading: false,
    error: null,
    success : false
  },
  reducers: {
    resetSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
        // wallet details
      .addCase(getWalletDetails.pending, (state) => {
            state.loading = true;
            state.error = false;
        })
      .addCase(getWalletDetails.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
        state.loading = false;
        state.error = false;
      })
      .addCase(getWalletDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        })

        // get transactions 
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.transactions = action.payload;
      })
      .addCase(addFunds.fulfilled, (state, action) => {
        state.balance += action.meta.arg;
      })
      .addCase(withdrawFunds.fulfilled, (state, action) => {
        state.balance -= action.meta.arg;
      })
        // Payment Verification
      .addCase(verifyPayment.fulfilled, (state, action) => {
        toast.success("Wallet updated successfully!");
        state.wallet.balance += Number(action.meta.arg.amount);
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        toast.error(action.payload || "Payment verification failed");
      })
      // fund transfer 
      .addCase(transferFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(transferFunds.fulfilled, (state) => {
        state.loading = false;
        state.success = true; // Set success to true
        state.error = null;
      })
      .addCase(transferFunds.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      });

  },
});

export default walletSlice.reducer;
