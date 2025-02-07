import { GoogleGenerativeAI } from '@google/generative-ai';
import Character from '../models/Character.js';
import Universe from '../models/Universe.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

class CharacterMatcher {
  static async generateTraits(userDescription) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Given this user description: "${userDescription}", 
        extract 5 key personality traits. Format as JSON array of objects with 
        name (trait name) and score (1-10). Example: 
        [{"name": "confident", "score": 8}]`;

      const result = await model.generateContent(prompt);
      const traits = JSON.parse(result.response.text());
      return traits;
    } catch (error) {
      console.error('Error generating traits:', error);
      throw error;
    }
  }

  static async findMatchingCharacters(userTraits, universe = null) {
    try {
      // Convert user traits to a vector
      const userVector = this._createTraitVector(userTraits);
      
      // Get characters from specified universe or all universes
      const query = universe ? { show: universe } : {};
      const characters = await Character.find(query);
      
      // Calculate similarity scores
      const matches = characters.map(character => {
        const charVector = this._createTraitVector(character.traits);
        const similarity = this._calculateCosineSimilarity(userVector, charVector);
        
        return {
          character,
          similarity,
          matchExplanation: this._generateMatchExplanation(userTraits, character.traits)
        };
      });
      
      // Sort by similarity and return top matches
      return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    } catch (error) {
      console.error('Error finding matching characters:', error);
      throw error;
    }
  }

  static async suggestAlternateUniverses(userTraits) {
    try {
      const universes = await Universe.find();
      const suggestions = [];

      for (const universe of universes) {
        const matches = await this.findMatchingCharacters(userTraits, universe.name);
        if (matches.length > 0) {
          suggestions.push({
            universe,
            bestMatch: matches[0],
            confidence: matches[0].similarity
          });
        }
      }

      return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
    } catch (error) {
      console.error('Error suggesting alternate universes:', error);
      throw error;
    }
  }

  static async trackCharacterEvolution(userId, timeframe = '1month') {
    try {
      const user = await User.findById(userId).populate('traits');
      const traitHistory = await TraitHistory.find({ 
        userId,
        timestamp: { $gte: this._getTimeframeDate(timeframe) }
      }).sort('timestamp');

      return this._analyzeTraitEvolution(traitHistory);
    } catch (error) {
      console.error('Error tracking character evolution:', error);
      throw error;
    }
  }

  // Private helper methods
  static _createTraitVector(traits) {
    // Convert traits to a normalized vector
    const vector = {};
    traits.forEach(trait => {
      vector[trait.name.toLowerCase()] = trait.score / 10; // Normalize to 0-1
    });
    return vector;
  }

  static _calculateCosineSimilarity(vector1, vector2) {
    // Calculate cosine similarity between two trait vectors
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    const allTraits = new Set([...Object.keys(vector1), ...Object.keys(vector2)]);

    allTraits.forEach(trait => {
      const v1 = vector1[trait] || 0;
      const v2 = vector2[trait] || 0;
      dotProduct += v1 * v2;
      norm1 += v1 * v1;
      norm2 += v2 * v2;
    });

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  static _generateMatchExplanation(userTraits, characterTraits) {
    const matchingTraits = [];
    const differentTraits = [];

    userTraits.forEach(userTrait => {
      const characterTrait = characterTraits.find(t => 
        t.name.toLowerCase() === userTrait.name.toLowerCase()
      );

      if (characterTrait) {
        const scoreDiff = Math.abs(userTrait.score - characterTrait.score);
        if (scoreDiff <= 2) {
          matchingTraits.push(userTrait.name);
        } else {
          differentTraits.push(userTrait.name);
        }
      }
    });

    return {
      matchingTraits,
      differentTraits,
      summary: this._createMatchingSummary(matchingTraits, differentTraits)
    };
  }

  static _createMatchingSummary(matchingTraits, differentTraits) {
    let summary = 'You match this character because ';
    
    if (matchingTraits.length > 0) {
      summary += `you share these traits: ${matchingTraits.join(', ')}. `;
    }
    
    if (differentTraits.length > 0) {
      summary += `However, you differ in: ${differentTraits.join(', ')}.`;
    }
    
    return summary;
  }

  static _getTimeframeDate(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case '1week':
        return new Date(now.setDate(now.getDate() - 7));
      case '1month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case '3months':
        return new Date(now.setMonth(now.getMonth() - 3));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  }
}

export default CharacterMatcher;
