// server.js (same as shown before, but here's the complete version)
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Store rooms in memory (use database in production)
const rooms = new Map();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        const parsedUrl = parse(req.url, true);
        await handler(req, res, parsedUrl);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: dev ? 'http://localhost:3000' : process.env.VERCEL_URL,
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // server.js - Add more detailed logging
        socket.on('join-room', ({ roomId, username }) => {
            console.log(`🔍 Join room request:`, { roomId, username, socketId: socket.id });

            socket.join(roomId);
            socket.username = username;
            socket.roomId = roomId;

            if (!rooms.has(roomId)) {
                console.log(`📝 Creating new room: ${roomId}`);
                rooms.set(roomId, {
                    id: roomId,
                    participants: [],
                    status: 'waiting',
                    duration: 25,
                    prompt: "Write about a character discovering something unexpected...",
                    startTime: null
                });
            }

            const room = rooms.get(roomId);
            console.log(`📊 Room before adding participant:`, room.participants.length);

            if (!room.participants.find(p => p.name === username)) {
                room.participants.push({
                    name: username,
                    wordCount: 0,
                    socketId: socket.id
                });
                console.log(`✅ Added participant ${username} to room ${roomId}`);
            }

            console.log(`📤 Sending room-joined event to ${socket.id}`);
            socket.emit('room-joined', room);

            console.log(`📢 Broadcasting participant-joined to room ${roomId}`);
            socket.to(roomId).emit('participant-joined', {
                username,
                participants: room.participants
            });
        });

        socket.on('word-count-update', ({ wordCount }) => {
            const { roomId, username } = socket;
            if (!roomId || !rooms.has(roomId)) return;

            const room = rooms.get(roomId);
            const participant = room.participants.find(p => p.name === username);

            if (participant) {
                participant.wordCount = wordCount;
                io.to(roomId).emit('participant-updated', {
                    username,
                    wordCount,
                    participants: room.participants
                });
            }
        });

        socket.on('start-sprint', () => {
            const { roomId } = socket;
            if (!roomId || !rooms.has(roomId)) return;

            const room = rooms.get(roomId);
            room.status = 'active';
            room.startTime = Date.now();

            io.to(roomId).emit('sprint-started', {
                status: room.status,
                startTime: room.startTime
            });

            setTimeout(() => {
                if (rooms.has(roomId)) {
                    const room = rooms.get(roomId);
                    room.status = 'finished';
                    io.to(roomId).emit('sprint-ended', {
                        status: room.status,
                        participants: room.participants
                    });
                }
            }, room.duration * 60 * 1000);
        });

        socket.on('disconnect', () => {
            const { roomId, username } = socket;
            if (roomId && rooms.has(roomId)) {
                const room = rooms.get(roomId);
                room.participants = room.participants.filter(p => p.socketId !== socket.id);

                socket.to(roomId).emit('participant-left', {
                    username,
                    participants: room.participants
                });

                if (room.participants.length === 0) {
                    rooms.delete(roomId);
                }
            }
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});