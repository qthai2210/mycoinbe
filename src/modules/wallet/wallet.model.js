const mongoose = require('mongoose');

// Check if the model already exists to prevent the OverwriteModelError
const WalletSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 100, // Initial balance for new wallets
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Safely export the model - prevents OverwriteModelError
module.exports =
  mongoose.models.Wallet || mongoose.model('Wallet', WalletSchema);
