import api from './index';

export const characterApi = {
  // Get all available universes
  getUniverses: async () => {
    try {
      const response = await api.get('/character/universes');
      return response.data;
    } catch (error) {
      throw error.error || 'Failed to fetch universes';
    }
  },

  // Get characters from a specific universe
  getCharacters: async (universeName) => {
    try {
      const response = await api.get(`/character/universe/${universeName}/characters`);
      return response.data;
    } catch (error) {
      throw error.error || 'Failed to fetch characters';
    }
  },

  // Generate traits from user description
  generateTraits: async (description) => {
    try {
      const response = await api.post('/character/generate-traits', { description });
      return response.data;
    } catch (error) {
      throw error.error || 'Failed to generate traits';
    }
  },

  // Find matching characters
  findMatches: async (traits, universe = null) => {
    try {
      const response = await api.post('/character/match', { traits, universe });
      return response.data;
    } catch (error) {
      throw error.error || 'Failed to find matches';
    }
  },

  // Get alternate universe suggestions
  suggestUniverses: async (traits) => {
    try {
      const response = await api.post('/character/suggest-universes', { traits });
      return response.data;
    } catch (error) {
      throw error.error || 'Failed to get universe suggestions';
    }
  },

  // Track character evolution
  getEvolution: async (timeframe = '1month') => {
    try {
      const response = await api.get(`/character/evolution/${timeframe}`);
      return response.data;
    } catch (error) {
      throw error.error || 'Failed to get character evolution';
    }
  }
};
