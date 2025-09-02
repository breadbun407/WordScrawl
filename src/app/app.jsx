// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [room, setRoom] = useState(null);
    const [username, setUsername] = useState('');

    return (
        <div className="app">
            {!room ? (
                <LobbyScreen onJoinRoom={setRoom} username={username} setUsername={setUsername} />
            ) : (
                <WritingRoom room={room} username={username} />
            )}
        </div>
    );
}

// LobbyScreen.js
function LobbyScreen({ onJoinRoom, username, setUsername }) {
    const [roomCode, setRoomCode] = useState('');

    const createRoom = () => {
        const newRoom = {
            id: Math.random().toString(36).substr(2, 9),
            participants: [{ name: username, wordCount: 0, text: '' }],
            status: 'waiting', // waiting, active, finished
            duration: 25, // minutes
            prompt: "Write about a character discovering something unexpected..."
        };
        onJoinRoom(newRoom);
    };

    const joinRoom = () => {
        // In a real app, you'd fetch room data from server
        // For now, simulate joining
        if (roomCode && username) {
            onJoinRoom({
                id: roomCode,
                participants: [{ name: username, wordCount: 0, text: '' }],
                status: 'waiting',
                duration: 25,
                prompt: "Write about a character discovering something unexpected..."
            });
        }
    };

    return (
        <div className="lobby">
            <h1>Writing Sprint Lobby</h1>

            <div className="user-setup">
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div className="room-actions">
                <button onClick={createRoom} disabled={!username}>
                    Create New Room
                </button>

                <div className="join-room">
                    <input
                        type="text"
                        placeholder="Room code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                    />
                    <button onClick={joinRoom} disabled={!username || !roomCode}>
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    );
}

// WritingRoom.js
function WritingRoom({ room, username }) {
    const [text, setText] = useState('');
    const [timeLeft, setTimeLeft] = useState(room.duration * 60); // convert to seconds
    const [sprintStatus, setSprintStatus] = useState(room.status);
    const [participants, setParticipants] = useState(room.participants);

    // Timer effect
    useEffect(() => {
        let timer;
        if (sprintStatus === 'active' && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setSprintStatus('finished');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [sprintStatus, timeLeft]);

    // Update word count when text changes
    useEffect(() => {
        const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
        setParticipants(prev =>
            prev.map(p =>
                p.name === username ? { ...p, wordCount, text } : p
            )
        );
    }, [text, username]);

    const startSprint = () => {
        setSprintStatus('active');
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const currentUser = participants.find(p => p.name === username);

    return (
        <div className="writing-room">
            <div className="room-header">
                <h2>Room: {room.id}</h2>
                <div className="timer">
                    Time: {formatTime(timeLeft)}
                </div>
                <div className="status">
                    Status: {sprintStatus}
                </div>
            </div>

            <div className="participants-bar">
                {participants.map(participant => (
                    <div key={participant.name} className="participant">
                        {participant.name}: {participant.wordCount} words
                    </div>
                ))}
            </div>

            {sprintStatus === 'waiting' && (
                <div className="waiting-area">
                    <div className="prompt">
                        <h3>Today's Prompt:</h3>
                        <p>{room.prompt}</p>
                    </div>
                    <button onClick={startSprint} className="start-button">
                        Start Sprint ({room.duration} minutes)
                    </button>
                </div>
            )}

            {sprintStatus === 'active' && (
                <div className="writing-area">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start writing..."
                        className="writing-textarea"
                        autoFocus
                    />
                    <div className="writing-stats">
                        Words: {currentUser?.wordCount || 0}
                    </div>
                </div>
            )}

            {sprintStatus === 'finished' && (
                <SprintResults participants={participants} />
            )}
        </div>
    );
}

// SprintResults.js
function SprintResults({ participants }) {
    const totalWords = participants.reduce((sum, p) => sum + p.wordCount, 0);
    const avgWords = Math.round(totalWords / participants.length);

    return (
        <div className="sprint-results">
            <h2>Sprint Complete!</h2>

            <div className="results-summary">
                <div className="stat">
                    <strong>Total Words:</strong> {totalWords}
                </div>
                <div className="stat">
                    <strong>Average:</strong> {avgWords} words per person
                </div>
            </div>

            <div className="participant-results">
                <h3>Individual Results:</h3>
                {participants
                    .sort((a, b) => b.wordCount - a.wordCount)
                    .map(participant => (
                        <div key={participant.name} className="result-item">
                            <span className="name">{participant.name}</span>
                            <span className="word-count">{participant.wordCount} words</span>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${(participant.wordCount / Math.max(...participants.map(p => p.wordCount))) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

export default App;