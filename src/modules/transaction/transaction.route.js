const express = require('express');
const router = express.Router();
const transactionController = require('./transaction.controller');

// Send coins
router.post('/send', transactionController.sendCoins);

// Get transaction history
router.get('/:address/history', transactionController.getTransactionHistory);

module.exports = router;
