import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    socketId: null,  
    isConnected: false  
};

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        setSocketId: (state, action) => {
            state.socketId = action.payload;
        },
        setConnectionStatus: (state, action) => {
            state.isConnected = action.payload;
        },
        disconnectSocket: (state) => {
            if (state.instance) {
                state.instance.disconnect();
                state.instance = null;
            }
            state.socketId = null;
            state.isConnected = false;
        },
    },
});

export const { 
    setSocketId, 
    setConnectionStatus, 
    disconnectSocket 
    } = socketSlice.actions;
export default socketSlice.reducer;
