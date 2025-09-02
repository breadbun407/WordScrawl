// src/hooks/useSocket.js
'use client';

import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const mountedRef = useRef(false);

    useEffect(() => {
        if (socketRef.current) return; // already connected

        console.log('🔌 Creating socket connection...');

        socketRef.current = io('http://localhost:3000', {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
        });

        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected:', socketRef.current.id);
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
            setIsConnected(false);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Socket connection failed:', error);
            setIsConnected(false);
        });

        // Cleanup only once (not during strict mode re-render)
        return () => {
            if (process.env.NODE_ENV === "production") {
                console.log('🔌 Cleaning up socket (production only)...');
                socketRef.current?.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
        };
    }, []);


    return {
        socket: socketRef.current,
        isConnected: isConnected && socketRef.current?.connected
    };
};