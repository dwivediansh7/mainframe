import React, { useState } from 'react';

const StoryDisplay = ({ story, onNewStoryRequest }) => {
  const [selectedStyle, setSelectedStyle] = useState('movie-trailer');
  const [customEvents, setCustomEvents] = useState('');

  const styles = [
    {
      id: 'movie-trailer',
      name: 'Movie Trailer',
      icon: '🎬'
    },
    {
      id: 'novel',
      name: 'Novel Excerpt',
      icon: '📚'
    },
    {
      id: 'anime-hero',
      name: 'Anime Hero',
      icon: '⚔️'
    }
  ];

  const handleNewStory = () => {
    const events = customEvents
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0);
    
    onNewStoryRequest(selectedStyle, events);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Story Display */}
      {story && (
        <div className="mb-8 p-6 bg-white/10 backdrop-blur-lg rounded-xl text-white">
          <p className="text-lg leading-relaxed whitespace-pre-line">{story}</p>
        </div>
      )}

      {/* Style Selection */}
      <div className="mb-6">
        <h3 className="text-lg text-white mb-3">Choose your story style:</h3>
        <div className="flex gap-4">
          {styles.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`flex-1 p-4 rounded-xl transition-all ${
                selectedStyle === style.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span className="text-2xl mb-2 block">{style.icon}</span>
              <span className="font-medium">{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Events */}
      <div className="mb-6">
        <h3 className="text-lg text-white mb-3">Add custom events (optional):</h3>
        <textarea
          value={customEvents}
          onChange={(e) => setCustomEvents(e.target.value)}
          placeholder="Enter events separated by commas (e.g., 'won a competition, started a business')"
          className="w-full p-4 rounded-xl bg-white/10 text-white placeholder-white/50 min-h-[100px]"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleNewStory}
        className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 
                 hover:from-purple-700 hover:to-blue-600 text-white text-lg font-semibold"
      >
        Generate New Story
      </button>
    </div>
  );
};

export default StoryDisplay;
