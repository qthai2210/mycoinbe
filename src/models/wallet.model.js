const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  privateKey: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  passphrase: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: String,  // Changed from ObjectId to String
    required: false // Make it optional
  }
});

module.exports = mongoose.model('Wallet', walletSchema);
