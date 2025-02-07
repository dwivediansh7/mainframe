import mongoose from 'mongoose';

const traitSchema = new mongoose.Schema({
  name: String,
  score: Number,
  source: {
    type: String,
    enum: ['manual', 'inferred'],
    default: 'manual'
  },
  lastUpdated: Date
});

const storySchema = new mongoose.Schema({
  content: String,
  style: {
    type: String,
    enum: ['movie-trailer', 'novel', 'anime-hero'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  events: [{
    type: String,
    description: String,
    impact: Number
  }]
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  traits: [traitSchema],
  stories: [storySchema],
  friends: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    relationship: {
      type: String,
      enum: ['rival', 'friend', 'mentor', 'mentee'],
      required: true
    },
    similarityScore: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);
