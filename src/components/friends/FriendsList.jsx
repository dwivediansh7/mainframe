import React, { useState, useEffect } from 'react';
import FriendCard from './FriendCard';
import Button from '../shared/Button';
import Card from '../shared/Card';

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/social/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setFriends(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch friends');
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('/api/social/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username })
      });
      
      const data = await response.json();
      if (response.ok) {
        setShowAddFriend(false);
        setUsername('');
        fetchFriends();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to send friend request');
    }
  };

  const handleChallenge = async (friend) => {
    try {
      const response = await fetch('/api/social/duels/automatic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        // Handle successful challenge
        // You might want to redirect to the duel page
      }
    } catch (err) {
      setError('Failed to create duel');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Your Friends</h2>
        <Button
          variant="primary"
          onClick={() => setShowAddFriend(true)}
        >
          Add Friend
        </Button>
      </div>

      {showAddFriend && (
        <Card className="mb-6">
          <Card.Header>
            <h3 className="text-lg font-medium">Add a Friend</h3>
          </Card.Header>
          <Card.Body>
            <form onSubmit={sendFriendRequest} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Enter username"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddFriend(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Send Request
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {friends.map((friend) => (
          <FriendCard
            key={friend.friend._id}
            friend={{
              ...friend.friend,
              compatibilityScore: friend.compatibilityScore,
              relationshipType: friend.relationshipType
            }}
            onChallenge={handleChallenge}
          />
        ))}
      </div>

      {friends.length === 0 && !showAddFriend && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No friends yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Start by adding some friends to compare traits and challenge them to duels!
          </p>
        </div>
      )}
    </div>
  );
}
