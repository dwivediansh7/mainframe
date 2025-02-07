import React, { useState } from 'react';
import FriendsList from '../components/friends/FriendsList';
import DuelsList from '../components/duels/DuelsList';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

const tabs = [
  { id: 'friends', name: 'Friends' },
  { id: 'duels', name: 'Duels' },
  { id: 'leaderboard', name: 'Leaderboard' }
];

export default function Social({ currentUserId }) {
  const [activeTab, setActiveTab] = useState('friends');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'friends' && <FriendsList />}
        {activeTab === 'duels' && <DuelsList currentUserId={currentUserId} />}
        {activeTab === 'leaderboard' && <LeaderboardTable />}
      </div>
    </div>
  );
}
