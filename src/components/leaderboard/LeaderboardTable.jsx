import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';

const categories = [
  { id: 'main_character', name: 'Main Character', description: 'Most voted protagonists' },
  { id: 'dramatic', name: 'Most Dramatic', description: 'Users with the most intense personality traits' },
  { id: 'relatable', name: 'Most Relatable', description: 'Users who resonate with others' }
];

export default function LeaderboardTable() {
  const [activeCategory, setActiveCategory] = useState('main_character');
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [activeCategory]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/social/leaderboard/${activeCategory}?limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboard(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <Badge variant="success">👑 1st</Badge>;
      case 2:
        return <Badge variant="primary">🥈 2nd</Badge>;
      case 3:
        return <Badge variant="warning">🥉 3rd</Badge>;
      default:
        return <Badge variant="gray">{rank}th</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <Card.Header>
        <div className="flex flex-col space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
          <div className="flex space-x-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  whitespace-nowrap py-2 px-4 rounded-lg text-sm font-medium transition-colors
                  ${activeCategory === category.id
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                {category.name}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            {categories.find(c => c.id === activeCategory)?.description}
          </p>
        </div>
      </Card.Header>

      <Card.Body>
        {isLoading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry._id}
                    className={index < 3 ? 'bg-gray-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRankBadge(index + 1)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-indigo-600">
                              {entry.user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {entry.user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.duelsWon} wins
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-medium">
                        {Math.round(entry.score)}
                      </div>
                      <div className="text-xs text-gray-500">
                        points
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <div className="text-xs text-gray-500">
                          Uniqueness: {Math.round(entry.uniquenessScore)}%
                        </div>
                        <div className="text-xs text-gray-500">
                          Engagement: {Math.round(entry.engagementScore)}%
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {leaderboard.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No entries yet. Start participating in duels to appear on the leaderboard!
              </div>
            )}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
