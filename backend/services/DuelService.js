import Duel from '../models/Duel.js';
import User from '../models/User.js';
import FriendshipService from './FriendshipService.js';
import LeaderboardService from './LeaderboardService.js';

class DuelService {
  async createAutomaticDuel(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Find potential opponents
    const potentialOpponents = await this.findPotentialOpponents(user);
    if (potentialOpponents.length === 0) {
      throw new Error('No suitable opponents found');
    }

    // Select the best match
    const opponent = potentialOpponents[0];
    const matchScore = await FriendshipService.calculateCompatibility(user, opponent);

    // Create the duel
    const duel = await Duel.create({
      challenger: userId,
      opponent: opponent._id,
      type: 'automatic',
      matchScore,
      startTime: new Date(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours duration
    });

    return await duel.populate(['challenger', 'opponent']);
  }

  async findPotentialOpponents(user) {
    // Find users with similar traits who aren't in an active duel
    const activeDuels = await Duel.find({
      $or: [
        { challenger: user._id },
        { opponent: user._id }
      ],
      status: { $in: ['pending', 'active'] }
    });

    const excludeUsers = activeDuels.map(duel => 
      duel.challenger.toString() === user._id.toString() ? 
        duel.opponent : duel.challenger
    );
    excludeUsers.push(user._id);

    return await User.find({
      _id: { $nin: excludeUsers },
      'traits.0': { $exists: true } // Must have traits defined
    }).limit(10);
  }

  async vote(duelId, voterId, votedForId) {
    const duel = await Duel.findById(duelId);
    if (!duel || duel.status !== 'active') {
      throw new Error('Invalid duel');
    }

    // Verify voter is allowed to vote
    if (!duel.viewers.includes(voterId)) {
      throw new Error('Not authorized to vote');
    }

    // Check if user already voted
    const existingVote = duel.votes.find(v => v.voter.toString() === voterId);
    if (existingVote) {
      throw new Error('Already voted');
    }

    // Add vote
    duel.votes.push({
      voter: voterId,
      votedFor: votedForId,
      timestamp: new Date()
    });

    // Check if duel should end
    if (duel.votes.length >= duel.viewers.length) {
      await this.endDuel(duel);
    } else {
      await duel.save();
    }

    return duel;
  }

  async endDuel(duel) {
    // Count votes
    const voteCount = duel.votes.reduce((acc, vote) => {
      acc[vote.votedFor.toString()] = (acc[vote.votedFor.toString()] || 0) + 1;
      return acc;
    }, {});

    // Determine winner
    let maxVotes = 0;
    let winner = null;
    for (const [userId, votes] of Object.entries(voteCount)) {
      if (votes > maxVotes) {
        maxVotes = votes;
        winner = userId;
      }
    }

    duel.winner = winner;
    duel.status = 'completed';
    await duel.save();

    // Update leaderboard
    await LeaderboardService.updateScores(duel);

    return duel;
  }

  async getDuelHistory(userId) {
    return await Duel.find({
      $or: [{ challenger: userId }, { opponent: userId }],
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .populate(['challenger', 'opponent', 'winner']);
  }
}

export default new DuelService();
