import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('>>> [SOCKET]: Client connected:', socket.id);

        socket.on('disconnect', () => {
            console.log('>>> [SOCKET]: Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        console.warn(">>> [SOCKET]: IO not initialized!");
    }
    return io;
};

export const emitUpdate = (type, data) => {
    if (io) {
        io.emit('update', { type, data });
        console.log(`>>> [SOCKET]: Emitted update event: ${type}`);
    }
};
