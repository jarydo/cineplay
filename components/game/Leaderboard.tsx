interface LeaderboardProps {
  players: Array<{ username: string; score: number }>;
}

export default function Leaderboard({ players }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {players
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <div
              key={player.username}
              className="flex items-center p-3 bg-gray-50 rounded"
            >
              <span className="w-8 font-bold">{index + 1}</span>
              <span className="flex-1">{player.username}</span>
              <span className="font-bold">{player.score}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
