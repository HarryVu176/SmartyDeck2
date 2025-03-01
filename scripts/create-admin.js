import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve the path to the .env file
const envPath = resolve(__dirname, '../.env');

// Check if .env file exists and load it
if (existsSync(envPath)) {
  console.log(`Loading environment variables from ${envPath}`);
  dotenv.config({ path: envPath });
} else {
  console.warn(`.env file not found at ${envPath}, using default environment variables`);
  dotenv.config();
}

// Log environment variables (without sensitive info)
console.log('Environment variables loaded:');
console.log(`- MONGO_URI: ${process.env.MONGO_URI ? '(set)' : '(not set)'}`);
console.log(`- MONGO_USER: ${process.env.MONGO_USER ? '(set)' : '(not set)'}`);
console.log(`- MONGO_PASSWORD: ${process.env.MONGO_PASSWORD ? '(set)' : '(not set)'}`);

// Dynamically import the models to avoid ESM issues
async function importModels() {
  // Define the schema for User
  const userSchema = new mongoose.Schema({
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false
    },
    salt: {
      type: String,
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    inviteCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InviteCode',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastLogin: {
      type: Date
    }
  }, { timestamps: true });

  // Add methods to the schema
  userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.password = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
      .toString('hex');
  };

  userSchema.methods.validPassword = function(password) {
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
      .toString('hex');
    return this.password === hash;
  };

  // Define the schema for InviteCode
  const inviteCodeSchema = new mongoose.Schema({
    code: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(4).toString('hex').toUpperCase()
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, { timestamps: true });

  // Create models
  const User = mongoose.models.User || mongoose.model('User', userSchema);
  const InviteCode = mongoose.models.InviteCode || mongoose.model('InviteCode', inviteCodeSchema);

  return { User, InviteCode };
}

// Connect to database
async function connectToDatabase() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/SmartyDeck2?authSource=admin';

  if (!MONGO_URI) {
    throw new Error('Please define the MONGO_URI environment variable');
  }

  try {
    await mongoose.connect(MONGO_URI, {
      authSource: 'admin',
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASSWORD,
    });
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function createAdmin() {
  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    
    // Import models
    const { User, InviteCode } = await importModels();
    
    // Get admin details from command line arguments
    const email = process.argv[2];
    const username = process.argv[3];
    const password = process.argv[4];
    
    if (!email || !username || !password) {
      console.error('Usage: node create-admin.js <email> <username> <password>');
      process.exit(1);
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`User with email ${email} already exists.`);
      
      // If user exists but is not admin, promote to admin
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`User ${email} has been promoted to admin.`);
      } else {
        console.log('User is already an admin.');
      }
      
      await mongoose.connection.close();
      return;
    }
    
    // Create an invite code for the admin
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 10); // Set expiry to 10 years in the future
    
    const inviteCode = new InviteCode({
      code: crypto.randomBytes(4).toString('hex').toUpperCase(),
      expiresAt,
      isUsed: false
    });
    
    await inviteCode.save();
    console.log(`Created invite code: ${inviteCode.code}`);
    
    // Create the admin user
    const admin = new User({
      email,
      username,
      role: 'admin',
      inviteCode: inviteCode._id
    });
    
    // Set password
    admin.setPassword(password);
    
    // Save the admin user
    await admin.save();
    
    // Mark invite code as used
    inviteCode.isUsed = true;
    inviteCode.usedBy = admin._id;
    await inviteCode.save();
    
    console.log(`Admin user created successfully:`);
    console.log(`- Email: ${email}`);
    console.log(`- Username: ${username}`);
    console.log(`- Role: admin`);
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Run the function
createAdmin();