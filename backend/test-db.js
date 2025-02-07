import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');

// Try connection without URL encoding
const uri = process.env.MONGODB_URI;
console.log('Using URI:', uri.replace(/\/\/([^:]+):([^@]+)@/, '//[USERNAME]:[PASSWORD]@'));

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error details:', {
      message: err.message,
      code: err.code,
      name: err.name
    });
    process.exit(1);
  });
