const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      connectTimeoutMS: parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS),
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
