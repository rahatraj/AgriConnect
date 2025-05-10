import { io } from "socket.io-client";
import { setSocketId, setConnectionStatus, } from "../slices/socketSlice";
import { updateBidLive, bidClosedUpdate, updateBuyerStats, updateFarmerStats, addNewBid } from "../slices/bidSlice";
import { addNotification } from "../slices/NotificationSlice";

let socket = null;
const baseURL=import.meta.env.VITE_API_URL
const localURL="http://localhost:3000/api/v1"
const socketMiddleware = (store) => (next) => (action) => {
    switch (action.type) {
        case "socket/connectSocket":
            if (!socket) {
                socket = io(baseURL, {
                    withCredentials: true,
                    transports: ["websocket", "polling"],
                    autoConnect: true, // Auto-reconnect on refresh
                });

                socket.on("connect", () => {
                    console.log(" Socket initialized:", socket);
                    console.log("Connected to the socket.io Server", socket.id);
                    store.dispatch(setSocketId(socket.id));
                    store.dispatch(setConnectionStatus(true));
                });

                socket.on("disconnect", () => {
                    console.log(" Disconnected from socket.io");
                    store.dispatch(setConnectionStatus(false));
                });

                // Listen for new bids
                socket.on("newBid", (newBid) => {
                    console.log("New bid created:", newBid);
                    store.dispatch(addNewBid(newBid));
                    store.dispatch(updateFarmerStats());
                    store.dispatch(updateBuyerStats());
                });

                // Listen for real-time bid updates
                socket.on("bidUpdated", (updatedBid) => {
                    console.log("Bid updated in real-time:", updatedBid);
                    store.dispatch(updateBidLive(updatedBid));
                    store.dispatch(updateFarmerStats());
                    store.dispatch(updateBuyerStats());
                });

                // Listen for bid closure events
                socket.on("bidClosed", (closedBid) => {
                    console.log("Bid closed:", closedBid);
                    store.dispatch(bidClosedUpdate(closedBid));
                    store.dispatch(updateFarmerStats());
                    store.dispatch(updateBuyerStats());
                });

                // Listen for notifications
                socket.on("notification", (notificationData) => {
                    console.log(" New notification received:", notificationData);
                    store.dispatch(addNotification(notificationData));
                });
            }
            break;

        case "bid/startBidding":
            if (socket) {
                socket.emit("startBidding", action.payload);
            } else {
                console.error("Socket is not connected. Unable to start bidding.");
            }
            break;

        case "bid/placeBid":
            if (socket) {
                socket.emit("placeBid", action.payload);
            } else {
                console.error("Socket is not connected. Unable to place bid.");
            }
            break;

        case "bid/closedBid":
            if (socket) {
                socket.emit("closeBid", action.payload);
            } else {
                console.error("Socket is not connected. Unable to close bid.");
            }
            break;

        case "socket/disconnectSocket":
            if (socket) {
                socket.disconnect();
                socket.removeAllListeners();
                socket = null;
                store.dispatch(setConnectionStatus(false));
            }
            break;

        default:
            break;
    }

    return next(action);
};
export const getSocket = () => socket;
export default socketMiddleware;
