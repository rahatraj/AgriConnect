import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";

export const fetchAlltransactions = createAsyncThunk(
    "transaction/fetchAlltransactions",
    async({ page = 1, limit = 10, sortBy = 'transactionDate', order = 'desc', type = '', search = '' }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/transactions?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&type=${type}&search=${search}`);
            console.log(response.data)
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data?.message || "Failed to fetch transactions");
        }
    }
);

const transactionSlice = createSlice({
    name: "transactions",
    initialState: {
        allTransaction: [],
        pagination: {
            currentPage: 1,
            totalPages: 1,
            totalTransactions: 0,
            hasNextPage: false,
            hasPrevPage: false
        },
        stats: {
            total: 0,
            completed: 0,
            pending: 0,
            totalAmount: 0
        },
        loading: false,
        errors: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAlltransactions.pending, (state) => {
                state.loading = true;
                state.errors = null;
            })
            .addCase(fetchAlltransactions.fulfilled, (state, action) => {
                state.allTransaction = action.payload.data.transactions;
                state.pagination = action.payload.data.pagination;
                state.stats = action.payload.data.stats;
                state.loading = false;
                state.errors = null;
            })
            .addCase(fetchAlltransactions.rejected, (state, action) => {
                state.errors = action.payload;
                state.loading = false;
            });
    }
});

export default transactionSlice.reducer;