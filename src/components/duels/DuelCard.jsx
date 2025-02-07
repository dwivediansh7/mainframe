import React from 'react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

const getTimeLeft = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end - now;
  
  if (diff <= 0) return 'Ended';
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
};

export default function DuelCard({ duel, onVote, currentUserId }) {
  const { challenger, opponent, votes, status, endTime, winner } = duel;
  const hasVoted = votes.some(vote => vote.voter === currentUserId);
  const totalVotes = votes.length;
  const timeLeft = getTimeLeft(endTime);

  const getVotePercentage = (userId) => {
    const userVotes = votes.filter(vote => vote.votedFor === userId).length;
    return totalVotes > 0 ? Math.round((userVotes / totalVotes) * 100) : 0;
  };

  const challengerVotes = getVotePercentage(challenger._id);
  const opponentVotes = getVotePercentage(opponent._id);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <Card.Body>
        <div className="flex justify-between items-start mb-6">
          <Badge
            variant={status === 'active' ? 'success' : 'gray'}
            className="mb-4"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
          {status === 'active' && (
            <span className="text-sm text-gray-500">{timeLeft}</span>
          )}
        </div>

        <div className="flex justify-between items-center space-x-4">
          {/* Challenger */}
          <div className="flex-1 text-center">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {challenger.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {winner && winner === challenger._id && (
                <Badge variant="success" className="absolute -top-2 -right-2">
                  Winner
                </Badge>
              )}
            </div>
            <h3 className="mt-2 text-lg font-medium">{challenger.username}</h3>
            <div className="mt-2">
              {challenger.traits.map(trait => (
                <div key={trait.name} className="text-sm text-gray-500">
                  {trait.name}: {trait.score}/10
                </div>
              ))}
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-400">VS</span>
            {status === 'active' && !hasVoted && (
              <div className="mt-4 space-y-2">
                <Button
                  size="sm"
                  onClick={() => onVote(challenger._id)}
                >
                  Vote
                </Button>
              </div>
            )}
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div className="relative">
              <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-indigo-600">
                  {opponent.username.charAt(0).toUpperCase()}
                </span>
              </div>
              {winner && winner === opponent._id && (
                <Badge variant="success" className="absolute -top-2 -right-2">
                  Winner
                </Badge>
              )}
            </div>
            <h3 className="mt-2 text-lg font-medium">{opponent.username}</h3>
            <div className="mt-2">
              {opponent.traits.map(trait => (
                <div key={trait.name} className="text-sm text-gray-500">
                  {trait.name}: {trait.score}/10
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card.Body>

      <Card.Footer>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full"
            style={{ width: `${challengerVotes}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>{challengerVotes}%</span>
          <span>{totalVotes} votes</span>
          <span>{opponentVotes}%</span>
        </div>
      </Card.Footer>
    </Card>
  );
}
