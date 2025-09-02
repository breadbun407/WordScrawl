// app/page.js
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LobbyForm from './components/LobbyForm';

export default function HomePage() {
  const router = useRouter();

  const handleCreateRoom = (username) => {
    const roomId = Math.random().toString(36).substr(2, 9);
    router.push(`/room/${roomId}?username=${encodeURIComponent(username)}`);
  };

  const handleJoinRoom = (roomCode, username) => {
    router.push(`/room/${roomCode}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Writing Sprints</h1>
          <p className="text-gray-600">Collaborative writing sessions for creators</p>
        </div>

        <LobbyForm
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </div>
    </div>
  );
}