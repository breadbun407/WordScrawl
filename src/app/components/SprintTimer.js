'use client';

import { useEffect } from 'react';

export default function SprintTimer({ timeLeft, setTimeLeft, isActive, inline = false }) {
    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, timeLeft, setTimeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const timeDisplay = formatTime(timeLeft);

    if (inline) {
        return <span className="font-mono">{timeDisplay}</span>;
    }

    return (
        <div className="text-center">
            <div className={`font-mono text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                }`}>
                {timeDisplay}
            </div>
            <div className="text-sm text-gray-600">remaining</div>
        </div>
    );
}