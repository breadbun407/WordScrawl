export default function ParticipantsList({ participants, currentUser }) {
    return (
        <div className="card">
            <h3 className="font-semibold mb-3">Participants ({participants.length})</h3>
            <div className="flex flex-wrap gap-3">
                {participants.map(participant => (
                    <div
                        key={participant.name}
                        className={`px-4 py-2 rounded-full ${participant.name === currentUser
                                ? 'bg-primary-100 text-primary-800 border-2 border-primary-300'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        <span className="font-medium">{participant.name}</span>
                        <span className="ml-2 text-sm">{participant.wordCount} words</span>
                    </div>
                ))}
            </div>
        </div>
    );
}