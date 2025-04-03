import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../services/axios";

// Auto-login
export const fetchCurrentUser = createAsyncThunk(
  "users/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users/me");
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Session expired.");
    }
  }
);

// Async thunk for user registration
export const userRegister = createAsyncThunk(
  "users/userRegister",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/register", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

// Async thunk for user login
export const userLogin = createAsyncThunk(
  "users/userLogin",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/login", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message);
    }
  }
);

export const userLogout = createAsyncThunk(
  "users/userLogout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users/logout");
      return true;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Logout failed");
    }
  }
);

// User slice
const userSlice = createSlice({
  name: "users",
  initialState: {
    data: null,
    isLoggedIn: false,
    loading: false,
    authChecked: false,
    error: null,
  },
  reducers: {
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
      if (!action.payload) {
        state.isLoggedIn = false;
        state.data = null;
      }
    },
    clearUserState: (state) => {
      state.data = null;
      state.isLoggedIn = false;
      state.authChecked = false; 
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isLoggedIn = true;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.isLoggedIn = false;
        state.authChecked = true;
        state.error = action.payload;
      })
      // User Register
      .addCase(userRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isLoggedIn = false;
        state.error = null;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // User Login
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.user;
        state.isLoggedIn = true;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
        state.authChecked = true;
      })
      // Logout
      .addCase(userLogout.fulfilled, (state) => {
        state.data = null;
        state.isLoggedIn = false;
        state.authChecked = false;
        state.error = null;
      })
      .addCase(userLogout.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setAuthChecked, clearUserState } = userSlice.actions;
export default userSlice.reducer;
