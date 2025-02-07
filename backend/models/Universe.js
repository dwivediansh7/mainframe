import mongoose from 'mongoose';

const universeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['TV Show', 'Movie', 'Book Series', 'Anime'],
    required: true
  },
  description: String,
  imageUrl: String,
  seasons: Number,
  yearStart: Number,
  yearEnd: Number,
  genre: [String],
  dominantTraits: [{
    name: String,
    description: String,
    frequency: Number // How often this trait appears in characters
  }],
  characterCount: Number,
  popularity: Number // Based on user matches
});

// Create indexes for efficient searching
universeSchema.index({ name: 'text', type: 'text', genre: 'text' });

const Universe = mongoose.model('Universe', universeSchema);

export default Universe;
