// src/hooks/useSocket.js
'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (socketRef.current) return; // already initialized

        // Determine the backend URL
        const SOCKET_URL =
            process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin;

        console.log('🔌 Creating socket connection to:', SOCKET_URL);

        socketRef.current = io(SOCKET_URL, {
            path: '/socket.io',            // Must match server
            transports: ['websocket'],     // Use only WebSocket for stability
            autoConnect: true,
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Socket connected:', socket.id);
            setIsConnected(true);
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Socket connection failed:', error);
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            console.log('🔌 Cleaning up socket...');
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected: isConnected && socketRef.current?.connected,
    };
};
