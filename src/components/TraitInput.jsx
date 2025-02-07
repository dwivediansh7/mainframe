import React, { useState } from 'react';

const PREDEFINED_TRAITS = [
  'Bold', 'Intelligent', 'Creative', 'Ambitious', 'Empathetic',
  'Risk-taker', 'Strategic', 'Charismatic', 'Resilient', 'Visionary'
];

const TraitInput = ({ onTraitsSubmit }) => {
  const [selectedTraits, setSelectedTraits] = useState([]);
  const [customTrait, setCustomTrait] = useState('');
  const [traitScores, setTraitScores] = useState({});

  const handleTraitSelect = (trait) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
      const { [trait]: _, ...rest } = traitScores;
      setTraitScores(rest);
    } else if (selectedTraits.length < 5) {
      setSelectedTraits([...selectedTraits, trait]);
      setTraitScores({ ...traitScores, [trait]: 7 });
    }
  };

  const handleCustomTraitAdd = () => {
    if (customTrait && !selectedTraits.includes(customTrait) && selectedTraits.length < 5) {
      setSelectedTraits([...selectedTraits, customTrait]);
      setTraitScores({ ...traitScores, [customTrait]: 7 });
      setCustomTrait('');
    }
  };

  const handleScoreChange = (trait, score) => {
    setTraitScores({ ...traitScores, [trait]: parseInt(score) });
  };

  const handleSubmit = () => {
    const traits = selectedTraits.map(trait => ({
      name: trait,
      score: traitScores[trait],
      source: 'manual'
    }));
    onTraitsSubmit(traits);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white/10 backdrop-blur-lg rounded-xl">
      <h2 className="text-2xl font-bold text-white mb-6">Define Your Character</h2>
      
      {/* Predefined Traits */}
      <div className="mb-8">
        <h3 className="text-lg text-white mb-3">Select up to 5 traits:</h3>
        <div className="flex flex-wrap gap-2">
          {PREDEFINED_TRAITS.map(trait => (
            <button
              key={trait}
              onClick={() => handleTraitSelect(trait)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedTraits.includes(trait)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {trait}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Trait Input */}
      <div className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={customTrait}
            onChange={(e) => setCustomTrait(e.target.value)}
            placeholder="Add custom trait..."
            className="flex-1 px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50"
          />
          <button
            onClick={handleCustomTraitAdd}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Selected Traits Scoring */}
      {selectedTraits.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg text-white mb-3">Rate your traits:</h3>
          <div className="space-y-4">
            {selectedTraits.map(trait => (
              <div key={trait} className="flex items-center gap-4">
                <span className="text-white min-w-[100px]">{trait}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={traitScores[trait]}
                  onChange={(e) => handleScoreChange(trait, e.target.value)}
                  className="flex-1"
                />
                <span className="text-white min-w-[30px]">{traitScores[trait]}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={selectedTraits.length === 0}
        className={`w-full py-3 rounded-lg text-white text-lg font-semibold ${
          selectedTraits.length > 0
            ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'
            : 'bg-gray-500 cursor-not-allowed'
        }`}
      >
        Generate My Story
      </button>
    </div>
  );
};

export default TraitInput;
