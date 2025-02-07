import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  unlockedAt: Date
});

const streakSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['daily_quiz', 'character_match', 'duel_participation', 'story_generation'],
    required: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  highestStreak: {
    type: Number,
    default: 0
  },
  lastActivity: Date
});

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  achievements: [achievementSchema],
  streaks: [streakSchema],
  dailyQuizzesTaken: {
    type: Number,
    default: 0
  },
  duelsWon: {
    type: Number,
    default: 0
  },
  duelsParticipated: {
    type: Number,
    default: 0
  },
  bestFriendCharacter: {
    characterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character'
    },
    matchScore: Number,
    unlockedAt: Date
  },
  characterEvolution: [{
    level: Number,
    traits: [{
      name: String,
      score: Number
    }],
    unlockedAt: Date
  }],
  lastDailyQuiz: Date,
  lastRewardClaim: Date
});

// Indexes for efficient querying
progressSchema.index({ userId: 1 });
progressSchema.index({ level: -1 });
progressSchema.index({ xp: -1 });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
