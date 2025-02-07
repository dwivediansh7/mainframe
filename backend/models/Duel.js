import mongoose from 'mongoose';

const duelSchema = new mongoose.Schema({
  challenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opponent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['automatic', 'challenge'],
    default: 'automatic'
  },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  votes: [{
    voter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    votedFor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  matchScore: { type: Number, default: 0 }, // Similarity score for matching
  startTime: Date,
  endTime: Date,
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for efficient queries
duelSchema.index({ challenger: 1, status: 1 });
duelSchema.index({ opponent: 1, status: 1 });
duelSchema.index({ status: 1, matchScore: -1 });

export default mongoose.model('Duel', duelSchema);
