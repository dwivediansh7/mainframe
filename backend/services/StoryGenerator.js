import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.OPENAI_API_KEY);  

class StoryGenerator {
  constructor() {
    this.stylePrompts = {
      'movie-trailer': 'Write an epic movie trailer narration about',
      'novel': 'Write a dramatic novel excerpt about',
      'anime-hero': 'Write an anime-style character introduction about'
    };
  }

  async generateStory(traits, style, events = []) {
    const traitString = traits.map(t => `${t.name} (${t.score}/10)`).join(', ');
    const eventString = events.length > 0 
      ? `\nIncorporate these events: ${events.join(', ')}`
      : '';

    const prompt = `${this.stylePrompts[style]} a character with these traits: ${traitString}.
      Make them feel like the main character of the story.${eventString}
      Focus on dramatic moments and character development.
      Length: 250-300 words.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Story generation error:', error);
      throw new Error('Failed to generate story');
    }
  }

  calculateSimilarity(userTraits, friendTraits) {
    let similarityScore = 0;
    const totalTraits = new Set([
      ...userTraits.map(t => t.name),
      ...friendTraits.map(t => t.name)
    ]).size;

    for (const userTrait of userTraits) {
      const friendTrait = friendTraits.find(t => t.name === userTrait.name);
      if (friendTrait) {
        const scoreDiff = Math.abs(userTrait.score - friendTrait.score);
        similarityScore += 1 - (scoreDiff / 10);
      }
    }

    return (similarityScore / totalTraits) * 100;
  }

  determineRelationship(similarityScore, userTraits, friendTraits) {
    if (similarityScore > 80) return 'friend';
    if (similarityScore < 40) return 'rival';
    
    const userAvg = userTraits.reduce((sum, t) => sum + t.score, 0) / userTraits.length;
    const friendAvg = friendTraits.reduce((sum, t) => sum + t.score, 0) / friendTraits.length;
    
    return userAvg > friendAvg ? 'mentor' : 'mentee';
  }
}

export default new StoryGenerator();
