import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Character from '../models/Character.js';
import Universe from '../models/Universe.js';

dotenv.config();

const universes = [
  {
    name: 'Suits',
    type: 'TV Show',
    description: 'Legal drama about a brilliant college dropout working at a top law firm',
    yearStart: 2011,
    yearEnd: 2019,
    seasons: 9,
    genre: ['Legal Drama', 'Comedy-Drama'],
    dominantTraits: [
      { name: 'Ambitious', description: 'Drive to succeed', frequency: 0.8 },
      { name: 'Intelligent', description: 'Quick thinking and sharp', frequency: 0.9 },
      { name: 'Loyal', description: 'Strong sense of loyalty', frequency: 0.7 }
    ]
  },
  {
    name: 'Breaking Bad',
    type: 'TV Show',
    description: 'A high school chemistry teacher turned methamphetamine manufacturer',
    yearStart: 2008,
    yearEnd: 2013,
    seasons: 5,
    genre: ['Crime Drama', 'Thriller'],
    dominantTraits: [
      { name: 'Intelligent', description: 'Scientific brilliance', frequency: 0.9 },
      { name: 'Determined', description: 'Unwavering resolve', frequency: 0.8 },
      { name: 'Complex', description: 'Morally ambiguous', frequency: 0.9 }
    ]
  },
  {
    name: 'Friends',
    type: 'TV Show',
    description: 'Sitcom about six friends living in New York City',
    yearStart: 1994,
    yearEnd: 2004,
    seasons: 10,
    genre: ['Sitcom', 'Comedy'],
    dominantTraits: [
      { name: 'Humorous', description: 'Sense of humor', frequency: 0.9 },
      { name: 'Loyal', description: 'Friendship focused', frequency: 0.8 },
      { name: 'Social', description: 'Outgoing personality', frequency: 0.7 }
    ]
  }
];

const characters = [
  {
    name: 'Harvey Specter',
    show: 'Suits',
    description: 'New York City\'s best closer, known for his confidence and wit',
    traits: [
      { name: 'Confident', score: 9, description: 'Extremely self-assured' },
      { name: 'Strategic', score: 8, description: 'Expert at planning and execution' },
      { name: 'Loyal', score: 7, description: 'Fiercely loyal to friends and allies' },
      { name: 'Competitive', score: 9, description: 'Loves to win' },
      { name: 'Charismatic', score: 8, description: 'Natural leader and charmer' }
    ],
    quotes: [
      "I don't have dreams, I have goals.",
      "Winners don't make excuses when the other side plays the game.",
      "That's the difference between you and me. You wanna lose small, I wanna win big."
    ]
  },
  {
    name: 'Walter White',
    show: 'Breaking Bad',
    description: 'Chemistry teacher turned methamphetamine kingpin',
    traits: [
      { name: 'Intelligent', score: 9, description: 'Brilliant chemist' },
      { name: 'Pride', score: 9, description: 'Extremely prideful' },
      { name: 'Manipulative', score: 8, description: 'Expert manipulator' },
      { name: 'Determined', score: 9, description: 'Highly determined' },
      { name: 'Strategic', score: 8, description: 'Calculated planner' }
    ],
    quotes: [
      "I am the one who knocks!",
      "I'm in the empire business.",
      "Say my name."
    ]
  },
  {
    name: 'Chandler Bing',
    show: 'Friends',
    description: 'Sarcastic friend known for his wit and humor',
    traits: [
      { name: 'Humorous', score: 9, description: 'Master of sarcasm' },
      { name: 'Loyal', score: 8, description: 'Great friend' },
      { name: 'Insecure', score: 7, description: 'Has personal insecurities' },
      { name: 'Caring', score: 7, description: 'Deeply cares for friends' },
      { name: 'Witty', score: 9, description: 'Quick with comebacks' }
    ],
    quotes: [
      "Could I BE wearing any more clothes?",
      "I'm not great at advice. Can I interest you in a sarcastic comment?",
      "Hi, I'm Chandler. I make jokes when I'm uncomfortable."
    ]
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Universe.deleteMany({});
    await Character.deleteMany({});
    console.log('Cleared existing data');

    // Seed universes
    await Universe.insertMany(universes);
    console.log('Seeded universes');

    // Seed characters
    await Character.insertMany(characters);
    console.log('Seeded characters');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
