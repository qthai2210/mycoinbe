const express = require('express');
const router = express.Router();
const transactionController = require('./transaction.controller');

// Send coins
router.post('/send', transactionController.sendCoins);

// Get transaction history
router.get('/:address/history', transactionController.getTransactionHistory);

// Get all blockchain transactions with pagination
router.get('/blockchain', transactionController.getAllBlockchainTransactions);

module.exports = router;
