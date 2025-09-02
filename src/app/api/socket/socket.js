// src/app/api/socket/route.js
import { Server } from 'socket.io';

const rooms = new Map();
let io;

export const dynamic = 'force-dynamic'; // ensures Next.js doesn't cache

export async function GET(request) {
    return new Response('Socket.IO server running', { status: 200 });
}

export async function POST(request) {
    return new Response('Method not allowed', { status: 405 });
}

export default function SocketHandler(req, res) {
    if (!res.socket.server.io) {
        console.log('🚀 Initializing Socket.IO server...');

        io = new Server(res.socket.server, {
            path: '/api/socket',
            cors: {
                origin:
                    process.env.NODE_ENV === 'production'
                        ? `https://${process.env.NEXT_PUBLIC_SOCKET_URL}`
                        : 'http://localhost:3000',
                methods: ['GET', 'POST'],
            },
        });

        io.on('connection', (socket) => {
            console.log('🟢 User connected:', socket.id);

            // Join room
            socket.on('join-room', ({ roomId, username }) => {
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
                        startTime: null,
                    });
                }

                const room = rooms.get(roomId);

                if (!room.participants.find((p) => p.name === username)) {
                    room.participants.push({
                        name: username,
                        wordCount: 0,
                        socketId: socket.id,
                    });
                }

                socket.emit('room-joined', room);
                socket.to(roomId).emit('participant-joined', {
                    username,
                    participants: room.participants,
                });
            });

            // Word count updates
            socket.on('word-count-update', ({ wordCount }) => {
                const { roomId, username } = socket;
                if (!roomId || !rooms.has(roomId)) return;

                const room = rooms.get(roomId);
                const participant = room.participants.find((p) => p.name === username);
                if (participant) {
                    participant.wordCount = wordCount;
                    io.to(roomId).emit('participant-updated', {
                        username,
                        wordCount,
                        participants: room.participants,
                    });
                }
            });

            // Start sprint
            socket.on('start-sprint', () => {
                const { roomId } = socket;
                if (!roomId || !rooms.has(roomId)) return;

                const room = rooms.get(roomId);
                room.status = 'active';
                room.startTime = Date.now();

                io.to(roomId).emit('sprint-started', {
                    status: room.status,
                    startTime: room.startTime,
                });

                setTimeout(() => {
                    if (rooms.has(roomId)) {
                        const room = rooms.get(roomId);
                        room.status = 'finished';
                        io.to(roomId).emit('sprint-ended', {
                            status: room.status,
                            participants: room.participants,
                        });
                    }
                }, room.duration * 60 * 1000);
            });

            // Disconnect
            socket.on('disconnect', () => {
                const { roomId, username } = socket;
                if (roomId && rooms.has(roomId)) {
                    const room = rooms.get(roomId);
                    room.participants = room.participants.filter(
                        (p) => p.socketId !== socket.id
                    );

                    socket.to(roomId).emit('participant-left', {
                        username,
                        participants: room.participants,
                    });

                    if (room.participants.length === 0) rooms.delete(roomId);
                }
            });
        });

        res.socket.server.io = io;
    }

    return res.end();
}
