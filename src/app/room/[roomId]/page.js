'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSocket } from '../../../hooks/useSocket';
import WritingRoom from '../../components/WritingRoom';

export default function RoomPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const roomId = params.roomId;
    const username = searchParams.get('username');

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket, isConnected } = useSocket();

    useEffect(() => {
        if (!username) {
            console.log('❌ No username, redirecting to home');
            router.push('/');
            return;
        }

        if (!socket || !isConnected || !roomId || !username) {
            console.log('⏳ Missing dependencies:', {
                socket: !!socket,
                isConnected,
                roomId,
                username
            });
            return;
        }

        console.log('🚀 Attempting to join room:', { roomId, username });
        socket.emit('join-room', { roomId, username });

        socket.on('room-joined', (roomData) => {
            console.log('✅ Room joined successfully:', roomData);
            setRoom(roomData);
            setLoading(false);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setLoading(false);
        });

        return () => {
            socket.off('room-joined');
            socket.off('connect_error');
        };
    }, [socket, isConnected, roomId, username, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                        {!isConnected ? 'Connecting to server...' : 'Joining room...'}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Socket: {socket ? '✅' : '❌'} | Connected: {isConnected ? '✅' : '❌'}
                    </p>
                </div>
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to join room</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Lobby
                    </button>
                </div>
            </div>
        );
    }
    // Display Room
    return (
        <WritingRoom
            room={room}
            username={username}
            socket={socket}
            onLeaveRoom={() => router.push('/')}
        />
    );
}