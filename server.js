// server.js
// Single Node server that runs next in production and attaches Socket.IO.
// Deploy this as a Web Service on Render (start script will run this file).

const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

// In-memory rooms (fine for small test/demo; use DB for production)
const rooms = new Map();

// Allowed frontend origin (set on Render as env var)
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        return handle(req, res);
    });

    // Attach Socket.IO to the same HTTP server
    const io = new Server(httpServer, {
        path: '/socket.io', // default path; clients can use default too
        cors: {
            origin: FRONTEND_ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);

        socket.on('join-room', ({ roomId, username }) => {
            console.log('join-room', { roomId, username, socketId: socket.id });

            socket.join(roomId);
            socket.username = username;
            socket.roomId = roomId;

            if (!rooms.has(roomId)) {
                rooms.set(roomId, {
                    id: roomId,
                    participants: [],
                    status: 'waiting',
                    duration: 25,
                    prompt: "Write about a character discovering something unexpected...",
                    startTime: null
                });
                console.log('Created room', roomId);
            }

            const room = rooms.get(roomId);
            if (!room.participants.find(p => p.name === username)) {
                room.participants.push({ name: username, wordCount: 0, socketId: socket.id });
            }

            socket.emit('room-joined', room);
            socket.to(roomId).emit('participant-joined', { username, participants: room.participants });

            console.log(`Room ${roomId} now has ${room.participants.length} participants`);
        });

        socket.on('word-count-update', ({ wordCount }) => {
            const { roomId, username } = socket;
            if (!roomId || !rooms.has(roomId)) return;
            const room = rooms.get(roomId);
            const participant = room.participants.find(p => p.name === username);
            if (participant) {
                participant.wordCount = wordCount;
                io.to(roomId).emit('participant-updated', { username, wordCount, participants: room.participants });
            }
        });

        socket.on('start-sprint', () => {
            const { roomId } = socket;
            if (!roomId || !rooms.has(roomId)) return;
            const room = rooms.get(roomId);
            room.status = 'active';
            room.startTime = Date.now();

            io.to(roomId).emit('sprint-started', { status: room.status, startTime: room.startTime });

            setTimeout(() => {
                if (rooms.has(roomId)) {
                    const r = rooms.get(roomId);
                    r.status = 'finished';
                    io.to(roomId).emit('sprint-ended', { status: r.status, participants: r.participants });
                }
            }, room.duration * 60 * 1000);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected:', socket.id);
            const { roomId, username } = socket;
            if (roomId && rooms.has(roomId)) {
                const room = rooms.get(roomId);
                room.participants = room.participants.filter(p => p.socketId !== socket.id);
                socket.to(roomId).emit('participant-left', { username, participants: room.participants });
                if (room.participants.length === 0) rooms.delete(roomId);
            }
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Server listening on port ${port} (NODE_ENV=${process.env.NODE_ENV})`);
    });
});
