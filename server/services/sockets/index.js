import { Server } from "socket.io";
import NotificationSocketHandler from "../notification_service/NotificationSockerHandler.js";

let io = null;

export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on('connection', (socket) => {
        const { userId, userType } = socket.handshake.query;

        console.log(`✅ ${userType?.toUpperCase()} connected: ${userId} (${socket.id})`);

        // Join user/admin to a personal room
        const roomName = `${userType}:${userId}`;
        socket.join(roomName);

        // Init handler
        const handler = new NotificationSocketHandler(io, socket, { id: userId, type: userType });

        // Cleanup
        socket.on('disconnect', () => {
            console.log(`❌ ${userType} disconnected: ${userId}`);
            socket.leave(roomName);
        });
    });

    console.log("🔌 Socket.IO initialized");
}

export function getIO() {
    if (!io) throw new Error("Socket.IO not initialized");
    return io;
}
