const express = require('express');
const walletController = require('./wallet.controller');
const router = express.Router();

// Create a new wallet
router.post('/', walletController.createWallet);

// Get wallet statistics
router.get('/:address/stats', walletController.getWalletStats);

// FOR TESTING ONLY - Get wallet with private key
router.get('/:address/test', walletController.getWalletWithPrivateKey);

// Generate secret recovery phrase
router.post('/generate-phrase', walletController.generateRecoveryPhrase);

// Restore wallet from recovery phrase
router.post('/restore', walletController.restoreWallet);

module.exports = router;
