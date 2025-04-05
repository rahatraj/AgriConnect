import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";

export const fetchAllUsers = createAsyncThunk(
    "admin/fetchAllUsers",
    async({page = 1}, {rejectWithValue})=> {
        try {
            const response = await axiosInstance.get(`/users/list?page=${page}`)
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || {message : "failed to fetch all the users"})
        }
    }
)

export const fetchAllDetails = createAsyncThunk(
    "admin/fetchAllDetails",
    async(__, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get("/users/getalldetails")
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || {message : "failed to fetch all the details"})
        }
    }
)

export const userActivation = createAsyncThunk(
    "admin/userActivation",
    async({userId, userStatus}, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.put(`/users/${userId}/useractivation`, { userStatus })
            return response.data
        } catch (error) {
            return rejectWithValue(error?.response?.data || {message : "failed to activation of the users"})
        }
    }
)

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        allUsers: null,
        allDetails: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.allUsers = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(fetchAllDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllDetails.fulfilled, (state, action) => {
                state.allDetails = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAllDetails.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            })
            .addCase(userActivation.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(userActivation.fulfilled, (state, action) => {
                // Update the user in the allUsers list
                if (state.allUsers?.data?.users) {
                    state.allUsers.data.users = state.allUsers.data.users.map(user => 
                        user._id === action.payload.user.id 
                            ? { ...user, status: action.payload.user.status }
                            : user
                    );
                }
                state.loading = false;
                state.error = null;
            })
            .addCase(userActivation.rejected, (state, action) => {
                state.error = action.payload;
                state.loading = false;
            });
    }
});

export default adminSlice.reducer;