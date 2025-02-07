import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-8">
          Welcome to MainFrame
        </h1>
        <p className="text-xl text-white text-center mb-12">
          Discover your main character energy and embrace your story
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Cards */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">AI Narratives</h3>
            <p>Transform your daily life into epic story arcs</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Character Match</h3>
            <p>Find your TV show character soulmate</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Friend Analysis</h3>
            <p>See how you fit into your friend group's story</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
