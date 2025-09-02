// app/components/LobbyForm.js
'use client';

import { useState } from 'react';

export default function LobbyForm({ onCreateRoom, onJoinRoom }) {
    const [username, setUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!username.trim()) return;
        onCreateRoom(username.trim());
    };

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (!username.trim() || !roomCode.trim()) return;
        onJoinRoom(roomCode.trim(), username.trim());
    };

    return (
        <div className="card">
            <form onSubmit={handleCreateRoom} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name
                    </label>
                    <input
                        id="username"
                        type="text"
                        className="input-field"
                        placeholder="Enter your name"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={!username.trim()}
                    className="btn-primary w-full"
                >
                    Create New Room
                </button>
            </form>

            <div className="my-6 text-center">
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                    or join existing room
                </span>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                    <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
                        Room Code
                    </label>
                    <input
                        id="roomCode"
                        type="text"
                        className="input-field"
                        placeholder="Enter room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={!username.trim() || !roomCode.trim()}
                    className="btn-secondary w-full"
                >
                    Join Room
                </button>
            </form>
        </div>
    );
}