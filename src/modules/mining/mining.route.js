const express = require('express');
const router = express.Router();
const miningController = require('./mining.controller');

// Set mining address
router.post('/address', miningController.setMiningAddress);

// Get mining status
router.get('/status', miningController.getMiningStatus);

// Set mining difficulty
router.post('/difficulty', miningController.setDifficulty);

// Start mining process
router.post('/start', miningController.startMining);

// Stop mining process
router.post('/stop', miningController.stopMining);

// Mine a single block (for testing)
router.post('/mine-block', miningController.mineBlock);

module.exports = router;
