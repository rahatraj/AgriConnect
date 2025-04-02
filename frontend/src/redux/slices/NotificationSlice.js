import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    notifications: [],
    unreadCount: 0,
};

const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        addNotification: (state, action) => {
            // Add a unique id using timestamp and random number
            const notification = {
                ...action.payload,
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                read: false
            };
            state.notifications.unshift(notification);
            state.unreadCount += 1;
        },
        markAsRead: (state) => {
            state.notifications = state.notifications.map((notification) => ({
                ...notification,
                read: true,
            }));
            state.unreadCount = 0;
        },
        markAllRead: (state) => {
            state.notifications.forEach((notification) => {
                notification.read = true;
            });
            state.unreadCount = 0;
        },
        clearNotification: (state) => {
            state.notifications = [];
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, markAsRead, markAllRead, clearNotification } =
    notificationsSlice.actions;

export default notificationsSlice.reducer;
