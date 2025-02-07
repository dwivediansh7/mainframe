import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api';

const Progress = ({ user }) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/gamification/progress');
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading progress...</div>;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Level and XP */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Level {progress.level}</h2>
        <div className="relative h-4 bg-gray-200 rounded-full">
          <motion.div
            className="absolute h-full bg-indigo-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(progress.xp % 1000) / 10}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {progress.xp % 1000}/1000 XP to next level
        </p>
      </div>

      {/* Streaks */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Active Streaks</h3>
        <div className="grid grid-cols-2 gap-4">
          {progress.streaks.map(streak => (
            <div
              key={streak.type}
              className="bg-indigo-50 p-4 rounded-lg"
            >
              <div className="text-2xl font-bold text-indigo-600">
                {streak.currentStreak}🔥
              </div>
              <div className="text-sm text-gray-600">
                {streak.type.replace('_', ' ')} streak
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">Recent Achievements</h3>
        <div className="grid grid-cols-1 gap-3">
          {progress.achievements.slice(-3).map(achievement => (
            <motion.div
              key={achievement.name}
              className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <div className="font-semibold">{achievement.name}</div>
                <div className="text-sm text-gray-600">
                  {achievement.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Character Evolution */}
      {progress.characterEvolution.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Character Evolution</h3>
          <div className="space-y-4">
            {progress.characterEvolution.map((evolution, index) => (
              <div
                key={index}
                className="bg-purple-50 p-4 rounded-lg"
              >
                <div className="font-semibold mb-2">
                  Level {evolution.level} Evolution
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {evolution.traits.map(trait => (
                    <div
                      key={trait.name}
                      className="text-sm text-gray-600"
                    >
                      {trait.name}: {trait.score}/10
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Best Friend Match */}
      {progress.bestFriendCharacter && (
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Your Best Friend Match</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="font-semibold">
                {progress.bestFriendCharacter.characterId.name}
              </div>
              <div className="text-sm text-gray-600">
                Match Score: {Math.round(progress.bestFriendCharacter.matchScore * 100)}%
              </div>
            </div>
            <button
              onClick={() => {/* Add share functionality */}}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
