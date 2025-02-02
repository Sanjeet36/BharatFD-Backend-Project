const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
    };

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/faq_db';
    
    if (!uri) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(uri, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Handle connection errors
mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB connection error: ${err}`);
});

// Handle disconnection
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
  // Attempt to reconnect
  connectDB();
});

// Close MongoDB connection on app termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error(`Error closing MongoDB connection: ${err}`);
    process.exit(1);
  }
});

module.exports = connectDB;
