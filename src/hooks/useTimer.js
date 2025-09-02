// hooks/useTimer.js
'use client';

import { useState, useEffect, useCallback } from 'react';

export const useTimer = (initialTime, autoStart = false) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isActive, setIsActive] = useState(autoStart);

    const start = useCallback(() => setIsActive(true), []);
    const pause = useCallback(() => setIsActive(false), []);
    const reset = useCallback(() => {
        setTimeLeft(initialTime);
        setIsActive(false);
    }, [initialTime]);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    useEffect(() => {
        if (timeLeft === 0) {
            setIsActive(false);
        }
    }, [timeLeft]);

    return {
        timeLeft,
        isActive,
        start,
        pause,
        reset,
        setTimeLeft
    };
};