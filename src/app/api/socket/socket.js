import { Server } from 'socket.io';

// Store rooms in memory (use database in production)
const rooms = new Map();

let io;

// Initialize Socket.IO server
function initializeSocket(res) {
    if (!res.socket.server.io) {
        console.log('Initializing Socket.IO server...');

        io = new Server(res.socket.server, {
            path: '/api/socket',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NODE_ENV === 'production'
                    ? process.env.VERCEL_URL
                    : 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });

        // Socket event handlers
        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            // Handle joining a room
            socket.on('join-room', ({ roomId, username }) => {
                console.log(`${username} joining room ${roomId}`);

                socket.join(roomId);
                socket.username = username;
                socket.roomId = roomId;

                // Get or create room
                if (!rooms.has(roomId)) {
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

                // Add participant if not already there
                if (!room.participants.find(p => p.name === username)) {
                    room.participants.push({
                        name: username,
                        wordCount: 0,
                        socketId: socket.id
                    });
                }

                socket.emit('room-joined', room);
                socket.to(roomId).emit('participant-joined', {
                    username,
                    participants: room.participants
                });
            });

            // Handle word count updates
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

            // Handle starting a sprint
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

                // Auto-end sprint
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

            // Handle disconnect
            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);

                const { roomId, username } = socket;
                if (roomId && rooms.has(roomId)) {
                    const room = rooms.get(roomId);
                    room.participants = room.participants.filter(p => p.socketId !== socket.id);

                    socket.to(roomId).emit('participant-left', {
                        username,
                        participants: room.participants
                    });

                    // Delete empty rooms
                    if (room.participants.length === 0) {
                        rooms.delete(roomId);
                    }
                }
            });
        });

        res.socket.server.io = io;
    }

    return io;
}

// Handle HTTP requests (this initializes the WebSocket server)
export async function GET(request) {
    return new Response('Socket.IO server running', { status: 200 });
}

// This is the key - we need to export the handler for the upgrade
export async function POST(request) {
    return new Response('Method not allowed', { status: 405 });
}

// Handle WebSocket upgrade
export const dynamic = 'force-dynamic';