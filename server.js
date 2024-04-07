import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Server } from "socket.io";

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import messageRoutes from "./src/routes/message.routes.js";

import connectToMongoDB from "./src/db/connectToMongoDB.js";

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server Running on port ${PORT}`);
});

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

let onlineUsers = [];
// Lắng nghe các sự kiện Socket.IO
io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    // Xử lý các sự kiện socket ở đây
    socket.on("addNewUser", (userId) => {
        !onlineUsers.some((user) => user.userId === userId) &&
            onlineUsers.push({
                userId,
                socketId: socket.id,
            });
        io.emit("getOnlineUsers", onlineUsers);
    });

    //add message
    socket.on("sendMessage", (message) => {
        const user = onlineUsers.find(
            (user) => user.userId === message.recipientId
        );
        if (user) {
            io.to(user.socketId).emit("getMessage", message);
            io.to(user.socketId).emit("getNotification", {
                senderId: message.senderId,
                isRead: false,
                date: new Date(),
            });
        }
    });

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
        io.emit("getOnlineUsers", onlineUsers);
    });
});
