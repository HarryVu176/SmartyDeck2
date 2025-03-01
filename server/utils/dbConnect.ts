import mongoose from 'mongoose';
import config from '../config/config';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = config.mongoURI;

let isConnected = false;

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable');
}

export async function connectToDatabase() {
  // If already connected, return the existing connection
  if (isConnected) {
    //console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const db = await mongoose.connect(MONGO_URI, {
      dbName: config.mongoDB,
    //   authSource: 'admin',
    //   user: config.mongoUser,
    //   pass: config.mongoPassword,
    });
    
    isConnected = true;
    console.log('Connected to MongoDB');
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      isConnected = false;
    });
    
    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      isConnected = false;
    });
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}
