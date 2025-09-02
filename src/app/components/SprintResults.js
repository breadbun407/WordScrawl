export default function SprintResults({ participants }) {
    const totalWords = participants.reduce((sum, p) => sum + p.wordCount, 0);
    const avgWords = Math.round(totalWords / participants.length);
    const maxWords = Math.max(...participants.map(p => p.wordCount));

    const sortedParticipants = [...participants].sort((a, b) => b.wordCount - a.wordCount);

    return (
        <div className="card">
            <h2 className="text-2xl font-bold text-center mb-6">Sprint Complete! 🎉</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                    <div className="text-3xl font-bold text-primary-600">{totalWords}</div>
                    <div className="text-gray-600">Total Words</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{avgWords}</div>
                    <div className="text-gray-600">Average Words</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{maxWords}</div>
                    <div className="text-gray-600">Top Score</div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Individual Results</h3>
                <div className="space-y-3">
                    {sortedParticipants.map((participant, index) => (
                        <div key={participant.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className="flex-shrink-0 w-8 text-center font-bold text-gray-600">
                                #{index + 1}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">{participant.name}</div>
                                <div className="text-sm text-gray-600">{participant.wordCount} words</div>
                            </div>
                            <div className="flex-shrink-0 w-32">
                                <div className="bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(participant.wordCount / maxWords) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}