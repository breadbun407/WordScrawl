'use client';

import { useState, useEffect } from 'react';

export default function WritingRoom({ room, username, socket, onLeaveRoom }) {
    const [text, setText] = useState('');
    const [timeLeft, setTimeLeft] = useState(room.duration * 60);
    const [sprintStatus, setSprintStatus] = useState(room.status);
    const [participants, setParticipants] = useState(room.participants);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleParticipantUpdated = ({ participants: newParticipants }) => {
            setParticipants(newParticipants);
        };
        const handleParticipantJoined = ({ username: newUser, participants: newParticipants }) => {
            setParticipants(newParticipants);
        };
        const handleParticipantLeft = ({ username: leftUser, participants: newParticipants }) => {
            setParticipants(newParticipants);
        };
        const handleSprintStarted = ({ startTime }) => {
            setSprintStatus('active');
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            setTimeLeft(Math.max(0, (room.duration * 60) - elapsed));
        };
        const handleSprintEnded = ({ participants: finalParticipants }) => {
            setSprintStatus('finished');
            setParticipants(finalParticipants);
            setTimeLeft(0);
        };

        socket.on('participant-updated', handleParticipantUpdated);
        socket.on('participant-joined', handleParticipantJoined);
        socket.on('participant-left', handleParticipantLeft);
        socket.on('sprint-started', handleSprintStarted);
        socket.on('sprint-ended', handleSprintEnded);

        return () => {
            socket.off('participant-updated', handleParticipantUpdated);
            socket.off('participant-joined', handleParticipantJoined);
            socket.off('participant-left', handleParticipantLeft);
            socket.off('sprint-started', handleSprintStarted);
            socket.off('sprint-ended', handleSprintEnded);
        };
    }, [socket, room.duration]);

    // Timer
    useEffect(() => {
        if (sprintStatus !== 'active' || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(timer);
    }, [sprintStatus, timeLeft]);

    // Word count updates
    useEffect(() => {
        if (!socket || !text || sprintStatus !== 'active') return;
        const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const timeout = setTimeout(() => socket.emit('word-count-update', { wordCount }), 500);
        return () => clearTimeout(timeout);
    }, [text, socket, sprintStatus]);

    const startSprint = () => { if (socket) socket.emit('start-sprint'); };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentWordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header card - use .card so global CSS applies */}
                <div className="card p-6">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ margin: 0 }} className="text-2xl font-bold">Room: {room.id}</h1>
                            <p className="text-gray-600">Status: {sprintStatus}</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className={`font-mono text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatTime(timeLeft)}
                                </div>
                                <div className="text-sm text-gray-600">remaining</div>
                            </div>

                            {/* room-buttons wrapper ensures our global styles apply */}
                            <div className="room-buttons">
                                <button onClick={onLeaveRoom} className="btn-secondary">
                                    Leave Room
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Participants */}
                <div className="card p-6">
                    <h3 className="font-semibold mb-3">Participants ({participants.length})</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {participants.map(participant => (
                            <div
                                key={participant.name}
                                className={`px-4 py-2 rounded-full ${participant.name === username ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-100 text-gray-700'}`}
                            >
                                <span className="font-medium">{participant.name}: </span>
                                <span className="ml-2 text-sm">{participant.wordCount} words</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Waiting UI */}
                {sprintStatus === 'waiting' && (
                    <div className="card p-8 text-center">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-3">Today&apos;s Prompt</h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-800 text-lg">{room.prompt}</p>
                            </div>
                        </div>

                        <div className="room-buttons" style={{ justifyContent: 'center' }}>
                            {/* use the .btn-primary class so our global style shows */}
                            <button onClick={startSprint} className="btn-primary">
                                Start Sprint ({room.duration} minutes)
                            </button>
                        </div>
                    </div>
                )}

                {/* Active - the prompt box uses the .prompt-box class */}
                {sprintStatus === 'active' && (
                    <div className="card p-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Write your story...</h3>
                            <div className="text-sm text-gray-600 mb-2">Prompt: {room.prompt}</div>
                        </div>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Start writing your story here..."
                            className="prompt-box"
                            autoFocus
                        />

                        <div className="mt-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="text-sm text-gray-600">
                                Keep writing! Time remaining: <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="text-lg font-semibold text-blue-600">
                                {currentWordCount} words
                            </div>
                        </div>
                    </div>
                )}

                {/* Finished */}
                {sprintStatus === 'finished' && (
                    <div className="card p-8">
                        <h2 className="text-2xl font-bold text-center mb-6">Sprint Complete!</h2>

                        {/* results summary */}
                        <div className="mt-8 text-center">
                            <button onClick={onLeaveRoom} className="btn-primary">
                                Return to Lobby
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
