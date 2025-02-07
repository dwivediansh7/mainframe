import mongoose from 'mongoose';

const friendshipSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  compatibilityScore: { type: Number, default: 0 },
  relationshipType: {
    type: String,
    enum: ['rival', 'mentor', 'mentee', 'friend'],
    default: 'friend'
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Ensure unique friendships
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

export default mongoose.model('Friendship', friendshipSchema);
