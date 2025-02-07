import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  text: String,
  options: [{
    text: String,
    traits: [{
      name: String,
      score: Number
    }]
  }]
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['daily', 'character_match', 'best_friend', 'evolution'],
    required: true
  },
  questions: [questionSchema],
  rewards: {
    xp: Number,
    achievements: [{
      name: String,
      description: String,
      icon: String,
      requiredScore: Number
    }]
  },
  availableFrom: Date,
  availableTo: Date,
  targetUniverse: {
    type: String,
    ref: 'Universe'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
});

// Indexes for efficient querying
quizSchema.index({ type: 1, availableFrom: 1, availableTo: 1 });
quizSchema.index({ targetUniverse: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
