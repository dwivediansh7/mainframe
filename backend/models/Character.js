import mongoose from 'mongoose';

const traitSchema = new mongoose.Schema({
  name: String,
  score: Number,
  description: String
});

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  show: {
    type: String,
    required: true
  },
  description: String,
  imageUrl: String,
  traits: [traitSchema],
  quotes: [String],
  archetype: String,
  relationships: [{
    character: String,
    relationship: String,
    description: String
  }],
  characterDevelopment: [{
    season: Number,
    arc: String,
    traits: [traitSchema]
  }]
});

// Create indexes for efficient searching
characterSchema.index({ name: 'text', show: 'text' });
characterSchema.index({ 'traits.name': 1 });

const Character = mongoose.model('Character', characterSchema);

export default Character;
