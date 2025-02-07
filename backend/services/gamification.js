import { GoogleGenerativeAI } from '@google/generative-ai';
import Progress from '../models/Progress.js';
import Quiz from '../models/Quiz.js';
import Character from '../models/Character.js';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

class GamificationService {
  static XP_LEVELS = {
    DAILY_QUIZ: 50,
    DUEL_WIN: 100,
    DUEL_PARTICIPATION: 25,
    STREAK_BONUS: 20,
    CHARACTER_MATCH: 30
  };

  static async updateProgress(userId, action, details = {}) {
    try {
      let progress = await Progress.findOne({ userId });
      
      if (!progress) {
        progress = new Progress({ userId });
      }

      switch (action) {
        case 'DAILY_QUIZ_COMPLETE':
          await this._handleDailyQuizCompletion(progress, details);
          break;
        case 'DUEL_COMPLETE':
          await this._handleDuelCompletion(progress, details);
          break;
        case 'CHARACTER_MATCH':
          await this._handleCharacterMatch(progress, details);
          break;
        case 'STREAK_UPDATE':
          await this._handleStreakUpdate(progress, details);
          break;
      }

      await this._checkLevelUp(progress);
      await progress.save();

      return progress;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  static async generateDailyQuiz(universe) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Create a personality quiz for the TV show ${universe} with 5 questions. 
        Format as JSON with questions array containing objects with text and options array. 
        Each option should have text and traits array (trait name and score 1-10).`;

      const result = await model.generateContent(prompt);
      const quizData = JSON.parse(result.response.text());

      const quiz = new Quiz({
        title: `Daily ${universe} Quiz`,
        type: 'daily',
        questions: quizData.questions,
        rewards: {
          xp: this.XP_LEVELS.DAILY_QUIZ,
          achievements: [{
            name: `${universe} Expert`,
            description: `Ace a daily quiz about ${universe}`,
            icon: '🏆',
            requiredScore: 80
          }]
        },
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
        targetUniverse: universe
      });

      await quiz.save();
      return quiz;
    } catch (error) {
      console.error('Error generating daily quiz:', error);
      throw error;
    }
  }

  static async findBestFriend(userId) {
    try {
      const progress = await Progress.findOne({ userId }).populate('bestFriendCharacter.characterId');
      
      // If best friend was found in last 24 hours, return existing
      if (progress.bestFriendCharacter && 
          progress.bestFriendCharacter.unlockedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        return progress.bestFriendCharacter;
      }

      const user = await User.findById(userId).populate('traits');
      const characters = await Character.find();

      // Find best matching character based on complementary traits
      const bestMatch = await this._findComplementaryMatch(user.traits, characters);

      // Generate friendship story
      const story = await this._generateFriendshipStory(user, bestMatch.character);

      // Update progress
      progress.bestFriendCharacter = {
        characterId: bestMatch.character._id,
        matchScore: bestMatch.score,
        unlockedAt: new Date()
      };
      await progress.save();

      return { ...bestMatch, story };
    } catch (error) {
      console.error('Error finding best friend:', error);
      throw error;
    }
  }

  // Private helper methods
  static async _handleDailyQuizCompletion(progress, { score, quizId }) {
    progress.dailyQuizzesTaken += 1;
    progress.xp += this.XP_LEVELS.DAILY_QUIZ;

    const quiz = await Quiz.findById(quizId);
    const achievementsEarned = quiz.rewards.achievements
      .filter(a => score >= a.requiredScore)
      .map(a => ({
        ...a,
        unlockedAt: new Date()
      }));

    progress.achievements.push(...achievementsEarned);
  }

  static async _handleDuelCompletion(progress, { won }) {
    progress.duelsParticipated += 1;
    progress.xp += this.XP_LEVELS.DUEL_PARTICIPATION;

    if (won) {
      progress.duelsWon += 1;
      progress.xp += this.XP_LEVELS.DUEL_WIN;
    }
  }

  static async _handleCharacterMatch(progress, { character, matchScore }) {
    progress.xp += this.XP_LEVELS.CHARACTER_MATCH;

    // Add to character evolution if high match
    if (matchScore > 0.8) {
      progress.characterEvolution.push({
        level: progress.characterEvolution.length + 1,
        traits: character.traits,
        unlockedAt: new Date()
      });
    }
  }

  static async _handleStreakUpdate(progress, { type }) {
    const streak = progress.streaks.find(s => s.type === type) || {
      type,
      currentStreak: 0,
      highestStreak: 0
    };

    const lastActivity = streak.lastActivity || new Date(0);
    const today = new Date();
    
    if (this._isConsecutiveDay(lastActivity, today)) {
      streak.currentStreak += 1;
      streak.highestStreak = Math.max(streak.currentStreak, streak.highestStreak);
      progress.xp += this.XP_LEVELS.STREAK_BONUS;
    } else if (!this._isSameDay(lastActivity, today)) {
      streak.currentStreak = 1;
    }

    streak.lastActivity = today;
    
    const streakIndex = progress.streaks.findIndex(s => s.type === type);
    if (streakIndex >= 0) {
      progress.streaks[streakIndex] = streak;
    } else {
      progress.streaks.push(streak);
    }
  }

  static async _checkLevelUp(progress) {
    const newLevel = Math.floor(progress.xp / 1000) + 1;
    if (newLevel > progress.level) {
      progress.level = newLevel;
      // Add level-up achievement
      progress.achievements.push({
        name: `Level ${newLevel}`,
        description: `Reached level ${newLevel}`,
        icon: '⭐',
        unlockedAt: new Date()
      });
    }
  }

  static _isConsecutiveDay(date1, date2) {
    const d1 = new Date(date1).setHours(0, 0, 0, 0);
    const d2 = new Date(date2).setHours(0, 0, 0, 0);
    return Math.abs(d2 - d1) === 24 * 60 * 60 * 1000;
  }

  static _isSameDay(date1, date2) {
    return new Date(date1).setHours(0, 0, 0, 0) === new Date(date2).setHours(0, 0, 0, 0);
  }

  static async _findComplementaryMatch(userTraits, characters) {
    // Find character with complementary traits that would make a good friend
    const matches = characters.map(character => {
      const score = this._calculateFriendshipScore(userTraits, character.traits);
      return { character, score };
    });

    return matches.sort((a, b) => b.score - a.score)[0];
  }

  static async _generateFriendshipStory(user, character) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `Create a short, fun story about why ${user.username} and ${character.name} 
      from ${character.show} would be best friends. Consider their shared and complementary traits.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  static _calculateFriendshipScore(userTraits, characterTraits) {
    // Calculate friendship compatibility based on both similar and complementary traits
    let score = 0;
    const processedTraits = new Set();

    // Score similar traits
    userTraits.forEach(userTrait => {
      const matchingTrait = characterTraits.find(t => 
        t.name.toLowerCase() === userTrait.name.toLowerCase()
      );
      if (matchingTrait) {
        score += (10 - Math.abs(userTrait.score - matchingTrait.score)) / 10;
        processedTraits.add(userTrait.name.toLowerCase());
      }
    });

    // Score complementary traits
    characterTraits.forEach(charTrait => {
      if (!processedTraits.has(charTrait.name.toLowerCase())) {
        // Complementary traits are valued but weighted less than direct matches
        score += 0.5;
      }
    });

    return score / Math.max(userTraits.length, characterTraits.length);
  }
}

export default GamificationService;
