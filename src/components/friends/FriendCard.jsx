import React from 'react';
import Card from '../shared/Card';
import Badge from '../shared/Badge';
import Button from '../shared/Button';

const relationshipColors = {
  rival: 'danger',
  mentor: 'success',
  mentee: 'info',
  friend: 'primary'
};

export default function FriendCard({ friend, onChallenge }) {
  const { username, traits, compatibilityScore, relationshipType } = friend;

  return (
    <Card hover className="w-full max-w-sm">
      <Card.Body>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{username}</h3>
            <div className="mt-1 flex items-center space-x-2">
              <Badge variant={relationshipColors[relationshipType]}>
                {relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)}
              </Badge>
              <span className="text-sm text-gray-500">
                {compatibilityScore}% Compatible
              </span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onChallenge(friend)}
          >
            Challenge
          </Button>
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Traits</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {traits.map((trait) => (
              <div
                key={trait.name}
                className="flex items-center space-x-1 text-sm"
              >
                <span className="font-medium">{trait.name}:</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${trait.score * 10}%` }}
                  />
                </div>
                <span className="text-gray-500">{trait.score}/10</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
