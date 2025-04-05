import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import cors from 'cors'

const app = express()
const server = http.createServer(app);
const localHost = 'http://localhost:5173'
const io = new Server(server,{
    cors : {
        origin : process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH', 'OPTIONS'],
        credentials : true
    },
    transports: ["websocket", "polling"],
});

io.on("connection", (socket)=> {
    console.log("A user connected : ", socket.id);

    // handle joining a room 
    socket.on("joinRoom", (roomId)=> {
        if (!roomId) {
            console.error(`Invalid roomId received for joinRoom: ${roomId}`);
            return;
        }    
        socket.join(roomId);
        console.log(`User ${socket.id} joined room : ${roomId}`)
    })

    // Handle new bid creation
    socket.on("startBidding", (newBid) => {
        if (!newBid) {
            console.error("Invalid newBid data received:", newBid);
            return;
        }
        console.log("New bid created:", newBid);
        // Broadcast to all connected clients
        io.emit("newBid", newBid);
    });

    socket.on("bidUpdate", (updatedBid) => {
        console.log(` Broadcasting bidUpdate to room: ${updatedBid.bidId}`);
        io.to(updatedBid.bidId).emit("bidUpdate", updatedBid);
    });

    // Handle notifications (User-Specific & System-Wide)
    socket.on("notification", (notificationData) => {
        if (!notificationData?.message) {
            console.error(" Invalid notification data received:", notificationData);
            return;
        }
    
        if (notificationData.userId) {
            // Send notification to a specific user
            console.log(` Sending personal notification to user ${notificationData.userId}: ${notificationData.message}`);
            io.to(notificationData.userId).emit("notification", notificationData);
        } else {
            // Broadcast system-wide notification to all connected users
            console.log(` Sending system-wide notification: ${notificationData.message}`);
            io.emit("notification", notificationData); // Broadcast to all users
        }
    });

    // **Handle Bid Closing**
    socket.on("bidClosed", (closedBid) => {
        if (!closedBid?.bidId) {
            console.error("Invalid bidClosed data received:", closedBid);
            return;
        }

        console.log(`Bid closed for room: ${closedBid.bidId}`);

        io.to(closedBid.bidId).emit("bidClosed", closedBid);

        io.to(closedBid.bidId).emit("leaveRoom", { bidId: closedBid.bidId });

        // Remove all users from the room
        io.socketsLeave(closedBid.bidId);
    });

    // leaving room 
    socket.on("leavingRoom", (roomId)=> {
        if (!roomId) {
            console.error(` Invalid roomId received for leavingRoom: ${roomId}`);
            return;
        }
        socket.leave(roomId);
        console.log(`User ${socket.id} left the room : ${roomId}`)
    })

    socket.on("disconnect", ()=> {
        console.log("User disconnected : ", socket.id)
    })

    socket.on("error", (err) => {
        console.error(`Socket error: ${err.message}`);
    });
})

export { io, app, server }

