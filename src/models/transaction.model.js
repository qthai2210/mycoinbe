const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fromAddress: {
    type: String,
    required: function () {
      return this.type !== 'MINING';
    },
  },
  toAddress: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['TRANSFER', 'MINING'],
    default: 'TRANSFER',
  },
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'FAILED'],
    default: 'PENDING',
  },
});

module.exports = mongoose.model('Transaction', transactionSchema);
