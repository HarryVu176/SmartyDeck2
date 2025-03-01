import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Create __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the .env file
dotenv.config();

const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/',
  mongoDB: process.env.MONGO_DB,
  mongoUser: process.env.MONGO_USER,
  mongoPassword: process.env.MONGO_PASSWORD,
  jwtSecret: process.env.JWT_SECRET || 'smd2',
  claudeApiKey: process.env.CLAUDE_API_KEY,
};

const requiredConfig = ['MONGO_URI', 'JWT_SECRET', 'CLAUDE_API_KEY'];

requiredConfig.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default config;
