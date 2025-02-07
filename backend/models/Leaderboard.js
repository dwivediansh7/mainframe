import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['main_character', 'dramatic', 'relatable'],
    required: true
  },
  score: { type: Number, default: 0 },
  rank: { type: Number },
  totalVotes: { type: Number, default: 0 },
  duelsWon: { type: Number, default: 0 },
  uniquenessScore: { type: Number, default: 0 }, // Based on trait combinations
  engagementScore: { type: Number, default: 0 }, // Based on participation
  lastUpdated: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for efficient ranking queries
leaderboardSchema.index({ category: 1, score: -1 });
leaderboardSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model('Leaderboard', leaderboardSchema);
