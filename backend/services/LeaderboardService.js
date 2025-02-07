import Leaderboard from '../models/Leaderboard.js';
import Duel from '../models/Duel.js';
import User from '../models/User.js';

class LeaderboardService {
  async updateScores(duel) {
    // Update winner's scores
    await this.updateUserScores(duel.winner, true);
    
    // Update loser's scores
    const loserId = duel.winner.toString() === duel.challenger.toString() 
      ? duel.opponent 
      : duel.challenger;
    await this.updateUserScores(loserId, false);
  }

  async updateUserScores(userId, won) {
    const user = await User.findById(userId);
    const categories = ['main_character', 'dramatic', 'relatable'];

    for (const category of categories) {
      let leaderboard = await Leaderboard.findOne({ user: userId, category });
      
      if (!leaderboard) {
        leaderboard = new Leaderboard({
          user: userId,
          category
        });
      }

      // Update scores based on category
      if (won) {
        leaderboard.duelsWon += 1;
        leaderboard.score += this.calculateCategoryScore(category, user);
      }

      leaderboard.totalVotes += 1;
      leaderboard.uniquenessScore = await this.calculateUniquenessScore(user);
      leaderboard.engagementScore = await this.calculateEngagementScore(userId);
      leaderboard.lastUpdated = new Date();

      await leaderboard.save();
      await this.updateRankings(category);
    }
  }

  calculateCategoryScore(category, user) {
    switch (category) {
      case 'main_character':
        return 10; // Base points for winning
      case 'dramatic':
        // Higher score for users with more extreme trait values
        return user.traits.reduce((sum, trait) => 
          sum + (Math.abs(trait.score - 5) / 5) * 10, 0) / user.traits.length;
      case 'relatable':
        // Higher score for users with balanced traits
        return user.traits.reduce((sum, trait) => 
          sum + (1 - Math.abs(trait.score - 5) / 5) * 10, 0) / user.traits.length;
      default:
        return 0;
    }
  }

  async calculateUniquenessScore(user) {
    // Compare trait combination with other users
    const allUsers = await User.find({ _id: { $ne: user._id } });
    let uniquenessScore = 100;

    for (const otherUser of allUsers) {
      const similarity = user.traits.reduce((sum, trait) => {
        const otherTrait = otherUser.traits.find(t => t.name === trait.name);
        if (otherTrait) {
          return sum + (1 - Math.abs(trait.score - otherTrait.score) / 10);
        }
        return sum + 1;
      }, 0) / user.traits.length;

      uniquenessScore = Math.min(uniquenessScore, (1 - similarity) * 100);
    }

    return uniquenessScore;
  }

  async calculateEngagementScore(userId) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Count recent duels
    const duelCount = await Duel.countDocuments({
      $or: [{ challenger: userId }, { opponent: userId }],
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Count votes cast
    const votesCount = await Duel.aggregate([
      { $match: { 'votes.voter': userId, createdAt: { $gte: thirtyDaysAgo } } },
      { $unwind: '$votes' },
      { $match: { 'votes.voter': userId } },
      { $count: 'total' }
    ]);

    return Math.min(100, (duelCount * 10 + (votesCount[0]?.total || 0) * 5));
  }

  async updateRankings(category) {
    const leaderboards = await Leaderboard.find({ category })
      .sort({ score: -1 });

    // Update ranks
    for (let i = 0; i < leaderboards.length; i++) {
      leaderboards[i].rank = i + 1;
      await leaderboards[i].save();
    }
  }

  async getLeaderboard(category, limit = 10) {
    return await Leaderboard.find({ category })
      .sort({ score: -1 })
      .limit(limit)
      .populate('user', 'username traits');
  }
}

export default new LeaderboardService();
