import React, { useState, useEffect } from 'react';
import Card from '../shared/Card';
import Button from '../shared/Button';
import { characterApi } from '../../api/character';

export default function CharacterMatch() {
  const [universes, setUniverses] = useState([]);
  const [selectedUniverse, setSelectedUniverse] = useState('');
  const [description, setDescription] = useState('');
  const [manualTraits, setManualTraits] = useState([]);
  const [generatedTraits, setGeneratedTraits] = useState([]);
  const [matches, setMatches] = useState([]);
  const [alternateMatches, setAlternateMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUniverses();
  }, []);

  const loadUniverses = async () => {
    try {
      const data = await characterApi.getUniverses();
      setUniverses(data);
    } catch (err) {
      setError('Failed to load universes');
    }
  };

  const handleGenerateTraits = async () => {
    try {
      setLoading(true);
      const { traits } = await characterApi.generateTraits(description);
      setGeneratedTraits(traits);
    } catch (err) {
      setError('Failed to generate traits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualTrait = () => {
    setManualTraits([...manualTraits, { name: '', score: 5 }]);
  };

  const handleTraitChange = (index, field, value) => {
    const updatedTraits = [...manualTraits];
    updatedTraits[index] = { ...updatedTraits[index], [field]: value };
    setManualTraits(updatedTraits);
  };

  const handleFindMatches = async () => {
    try {
      setLoading(true);
      const traits = [...manualTraits, ...generatedTraits];
      
      // Get primary matches
      const { matches: primaryMatches } = await characterApi.findMatches(
        traits,
        selectedUniverse
      );
      setMatches(primaryMatches);

      // Get alternate universe suggestions
      const { suggestions } = await characterApi.suggestUniverses(traits);
      setAlternateMatches(suggestions);
    } catch (err) {
      setError('Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Your Character Match</h1>

      {/* Universe Selection */}
      <Card className="mb-8">
        <Card.Body>
          <h2 className="text-xl font-semibold mb-4">Select Your Universe</h2>
          <select
            className="w-full p-2 border rounded"
            value={selectedUniverse}
            onChange={(e) => setSelectedUniverse(e.target.value)}
          >
            <option value="">Select a TV Show/Movie</option>
            {universes.map(universe => (
              <option key={universe._id} value={universe.name}>
                {universe.name}
              </option>
            ))}
          </select>
        </Card.Body>
      </Card>

      {/* Trait Generation */}
      <Card className="mb-8">
        <Card.Body>
          <h2 className="text-xl font-semibold mb-4">Describe Yourself</h2>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your personality, behaviors, and characteristics..."
          />
          <Button
            onClick={handleGenerateTraits}
            disabled={loading || !description}
            variant="secondary"
          >
            Generate Traits
          </Button>
        </Card.Body>
      </Card>

      {/* Manual Traits */}
      <Card className="mb-8">
        <Card.Body>
          <h2 className="text-xl font-semibold mb-4">Manual Traits</h2>
          {manualTraits.map((trait, index) => (
            <div key={index} className="flex gap-4 mb-4">
              <input
                type="text"
                className="flex-1 p-2 border rounded"
                value={trait.name}
                onChange={(e) => handleTraitChange(index, 'name', e.target.value)}
                placeholder="Trait name"
              />
              <input
                type="range"
                min="1"
                max="10"
                className="w-32"
                value={trait.score}
                onChange={(e) => handleTraitChange(index, 'score', e.target.value)}
              />
              <span className="w-8">{trait.score}</span>
            </div>
          ))}
          <Button onClick={handleAddManualTrait} variant="secondary">
            Add Trait
          </Button>
        </Card.Body>
      </Card>

      {/* Generated Traits */}
      {generatedTraits.length > 0 && (
        <Card className="mb-8">
          <Card.Body>
            <h2 className="text-xl font-semibold mb-4">Generated Traits</h2>
            <div className="grid grid-cols-2 gap-4">
              {generatedTraits.map((trait, index) => (
                <div key={index} className="p-4 border rounded">
                  <div className="font-medium">{trait.name}</div>
                  <div className="text-gray-600">Score: {trait.score}/10</div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Find Matches Button */}
      <div className="mb-8">
        <Button
          onClick={handleFindMatches}
          disabled={loading || (!manualTraits.length && !generatedTraits.length)}
          variant="primary"
          className="w-full"
        >
          Find Your Character Matches
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Matches Display */}
      {matches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map((match, index) => (
            <Card key={index} hover>
              <Card.Body>
                <div className="aspect-w-3 aspect-h-4 mb-4">
                  <img
                    src={match.character.imageUrl}
                    alt={match.character.name}
                    className="object-cover rounded"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2">{match.character.name}</h3>
                <p className="text-gray-600 mb-4">{match.character.show}</p>
                <div className="mb-4">
                  <div className="font-medium">Match Score:</div>
                  <div className="text-2xl font-bold">
                    {Math.round(match.similarity * 100)}%
                  </div>
                </div>
                <div className="mb-4">
                  <div className="font-medium">Matching Traits:</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match.matchExplanation.matchingTraits.map((trait, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-100 text-green-800 rounded"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
                {match.matchExplanation.differentTraits.length > 0 && (
                  <div>
                    <div className="font-medium">Different Traits:</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {match.matchExplanation.differentTraits.map((trait, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-800 rounded"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Alternate Universe Matches */}
      {alternateMatches.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">In Other Universes...</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {alternateMatches.map((match, index) => (
              <Card key={index} hover>
                <Card.Body>
                  <h3 className="text-xl font-bold mb-2">
                    {match.universe.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You would be {match.bestMatch.character.name}
                  </p>
                  <div className="text-sm">
                    Confidence: {Math.round(match.confidence * 100)}%
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
