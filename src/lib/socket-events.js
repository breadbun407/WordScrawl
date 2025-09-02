// lib/socket-events.js
export const SOCKET_EVENTS = {
    // Client to server
    JOIN_ROOM: 'join-room',
    WORD_COUNT_UPDATE: 'word-count-update',
    START_SPRINT: 'start-sprint',

    // Server to client
    ROOM_JOINED: 'room-joined',
    PARTICIPANT_JOINED: 'participant-joined',
    PARTICIPANT_LEFT: 'participant-left',
    PARTICIPANT_UPDATED: 'participant-updated',
    SPRINT_STARTED: 'sprint-started',
    SPRINT_ENDED: 'sprint-ended'
};

export const ROOM_STATUS = {
    WAITING: 'waiting',
    ACTIVE: 'active',
    FINISHED: 'finished'
};