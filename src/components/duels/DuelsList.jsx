import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DuelCard from './DuelCard';
import Button from '../shared/Button';
import Card from '../shared/Card';

export default function DuelsList({ currentUserId }) {
  const [activeDuels, setActiveDuels] = useState([]);
  const [pastDuels, setPastDuels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    newSocket.on('voteUpdate', ({ duelId, votes, totalVoters }) => {
      setActiveDuels(duels => 
        duels.map(duel => 
          duel._id === duelId 
            ? { ...duel, votes, totalVoters }
            : duel
        )
      );
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    fetchDuels();
  }, []);

  const fetchDuels = async () => {
    try {
      const response = await fetch('/api/social/duels/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setActiveDuels(data.filter(duel => duel.status === 'active'));
        setPastDuels(data.filter(duel => duel.status === 'completed'));
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch duels');
    } finally {
      setIsLoading(false);
    }
  };

  const createAutomaticDuel = async () => {
    try {
      const response = await fetch('/api/social/duels/automatic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setActiveDuels(duels => [...duels, data]);
        // Join the duel room for real-time updates
        socket?.emit('joinDuel', data._id);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to create duel');
    }
  };

  const handleVote = async (duelId, votedForId) => {
    try {
      const response = await fetch(`/api/social/duels/${duelId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ votedFor: votedForId })
      });
      
      const data = await response.json();
      if (response.ok) {
        setActiveDuels(duels =>
          duels.map(duel =>
            duel._id === duelId ? data : duel
          )
        );
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to submit vote');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Duels</h2>
        <Button
          variant="primary"
          onClick={createAutomaticDuel}
        >
          Find a Match
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Active Duels */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Duels</h3>
        <div className="space-y-6">
          {activeDuels.map(duel => (
            <DuelCard
              key={duel._id}
              duel={duel}
              currentUserId={currentUserId}
              onVote={(votedForId) => handleVote(duel._id, votedForId)}
            />
          ))}
          {activeDuels.length === 0 && (
            <Card>
              <Card.Body>
                <p className="text-center text-gray-500">
                  No active duels. Start one by clicking "Find a Match"!
                </p>
              </Card.Body>
            </Card>
          )}
        </div>
      </section>

      {/* Past Duels */}
      <section>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Past Duels</h3>
        <div className="space-y-6">
          {pastDuels.map(duel => (
            <DuelCard
              key={duel._id}
              duel={duel}
              currentUserId={currentUserId}
            />
          ))}
          {pastDuels.length === 0 && (
            <Card>
              <Card.Body>
                <p className="text-center text-gray-500">
                  No past duels yet. Your completed duels will appear here.
                </p>
              </Card.Body>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
