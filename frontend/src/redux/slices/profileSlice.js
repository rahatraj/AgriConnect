import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";

export const getProfile = createAsyncThunk(
    "profile/getProfile",
    async(__, {rejectWithValue})=> {
        try {
            const response = await axiosInstance.get("/users/profile")
            return response.data.profile
        } catch (error) {
            return rejectWithValue(error?.response?.data || {message : "Failed to load the profiel" })
        }
    }
)
export const updateProfile = createAsyncThunk(
    "profile/updateProfile",
    async(formData,{rejectWithValue})=>{
        try {
            const response = await axiosInstance.post("/users/update/profile", formData)
            return response.data;
        } catch (error) {
            return rejectWithValue(error?.response?.data || {message : "Failed to update the profiel" })
        }
    }
)
const profileSlice = createSlice({
    name : "profile",
    initialState : {
        profile : null,
        loading : false,
        error : null
    },
    reducers : {},
    extraReducers : (builder)=> {
        builder
            // Fetch Profile
            .addCase(getProfile.pending, (state) => {
            state.loading = true;
            state.error = null;
            })
            .addCase(getProfile.fulfilled, (state, action) => {
            state.profile = action.payload;
            state.loading = false;
            state.error = null;
            })
            .addCase(getProfile.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            })

    }
})

export default profileSlice.reducer;