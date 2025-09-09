const crypto = require('crypto');
const mongoose = require('mongoose');
// Import Wallet model to update miner's balance - use mongoose.models to avoid OverwriteModelError
let Wallet;
try {
  // Try to get existing model
  Wallet = mongoose.model('Wallet');
} catch (error) {
  // If model doesn't exist yet, it will be created when wallet.model.js is imported
  Wallet = require('../wallet/wallet.model');
}

// Base mining reward amount
const BASE_MINING_REWARD = 10;

// Remove fixed MINING_REWARD and replace with a function to calculate it
// Make calculateMiningReward function accessible to controller
exports.calculateMiningReward = (difficulty, timeInSeconds) => {
  // Formula: Base reward * difficulty factor * time efficiency factor
  // Higher difficulty = more reward
  // Faster mining (less time) = bonus reward

  const difficultyFactor = difficulty;

  // Calculate time efficiency factor (bonus for mining quickly)
  // Base expectation: 10 seconds per difficulty level
  const expectedTime = difficulty * 10;
  const timeEfficiencyFactor = Math.max(
    0.5,
    Math.min(1.5, expectedTime / (timeInSeconds || 1)),
  );

  const reward = Math.round(
    BASE_MINING_REWARD * difficultyFactor * timeEfficiencyFactor,
  );

  // Ensure minimum reward of BASE_MINING_REWARD
  return Math.max(BASE_MINING_REWARD, reward);
};

// In a real application, you'd have models for these
let miningConfig = {
  miningAddress: null,
  mining: false,
  difficulty: 4,
};

// Mock blockchain data - in a real app you'd have actual models
let blockchain = {
  chain: [
    {
      timestamp: Date.now(),
      transactions: [],
      previousHash:
        '0000000000000000000000000000000000000000000000000000000000000000',
      index: 0,
      nonce: 0,
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
    },
  ],
  pendingTransactions: [],
};

/**
 * Sets the mining address
 */
exports.setMiningAddress = async (address) => {
  miningConfig.miningAddress = address;
  return address;
};

/**
 * Returns current mining status
 */
exports.getMiningStatus = async () => {
  return {
    mining: miningConfig.mining,
    difficulty: miningConfig.difficulty,
    miningAddress: miningConfig.miningAddress,
  };
};

/**
 * Set the difficulty level for mining
 */
exports.setDifficulty = async (difficulty) => {
  miningConfig.difficulty = difficulty;
  return difficulty;
};

/**
 * Start the mining process
 */
exports.startMining = async () => {
  if (!miningConfig.miningAddress) {
    throw new Error('Mining address must be set before starting mining');
  }

  // Don't start if already mining
  if (miningConfig.mining) {
    return;
  }

  miningConfig.mining = true;

  // Start mining in background
  this._miningProcess();
};

/**
 * Background mining process
 */
exports._miningProcess = async () => {
  while (miningConfig.mining) {
    await this.mineBlock(miningConfig.miningAddress);
    // Add a small delay to prevent CPU overload
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

/**
 * Stop the mining process
 */
exports.stopMining = async () => {
  miningConfig.mining = false;
};

/**
 * Mine a new block with pending transactions
 */
exports.mineBlock = async (minerAddress) => {
  // Record start time for mining
  const startTime = Date.now();

  // Create a new block
  const previousBlock = blockchain.chain[blockchain.chain.length - 1];
  const newBlock = {
    timestamp: Date.now(),
    transactions: [...blockchain.pendingTransactions],
    previousHash: previousBlock.hash,
    index: previousBlock.index + 1,
    nonce: 0,
  };

  // Mine the block (find a valid hash)
  const validBlock = await this._proofOfWork(newBlock);

  // Calculate mining time in seconds
  const endTime = Date.now();
  const miningTimeInSeconds = (endTime - startTime) / 1000;

  // Calculate mining reward based on difficulty and time
  const miningReward = this.calculateMiningReward(
    miningConfig.difficulty,
    miningTimeInSeconds,
  );

  // Create mining reward transaction
  const rewardTx = {
    fromAddress: null, // null means it's a mining reward
    toAddress: minerAddress,
    amount: miningReward, // Dynamic mining reward
    timestamp: Date.now(),
    hash: crypto.randomBytes(32).toString('hex'),
  };

  // Add reward transaction to the block
  validBlock.transactions.push(rewardTx);

  // Recalculate hash with the added reward transaction
  validBlock.hash = this._calculateHash(validBlock);

  // Add the new block to the chain
  blockchain.chain.push(validBlock);

  // Update the miner's wallet balance with the mining reward
  try {
    // Find the wallet by address and update its balance
    const wallet = await Wallet.findOne({ address: minerAddress });

    if (wallet) {
      wallet.balance += miningReward;
      await wallet.save();
      console.log(
        `Added ${miningReward} coins to wallet ${minerAddress} (Difficulty: ${miningConfig.difficulty}, Time: ${miningTimeInSeconds.toFixed(
          2,
        )}s)`,
      );
    } else {
      console.error(`Wallet not found for mining address: ${minerAddress}`);
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
  }

  // Clear pending transactions
  blockchain.pendingTransactions = [];

  // Add mining stats to block
  validBlock.miningStats = {
    difficulty: miningConfig.difficulty,
    timeInSeconds: miningTimeInSeconds,
    reward: miningReward,
  };

  return validBlock;
};

/**
 * Proof of work algorithm
 * Keeps incrementing nonce until hash meets difficulty criteria
 */
exports._proofOfWork = async (block) => {
  let nonce = 0;
  let hash = '';
  const difficultyPrefix = '0'.repeat(miningConfig.difficulty);

  while (true) {
    block.nonce = nonce;
    hash = this._calculateHash(block);

    if (hash.startsWith(difficultyPrefix)) {
      break;
    }

    nonce++;
  }

  block.hash = hash;
  return block;
};

/**
 * Calculate hash of a block
 */
exports._calculateHash = (block) => {
  const blockString = JSON.stringify({
    timestamp: block.timestamp,
    transactions: block.transactions,
    previousHash: block.previousHash,
    index: block.index,
    nonce: block.nonce,
  });

  return crypto.createHash('sha256').update(blockString).digest('hex');
};

/**
 * Check if block hash is valid (meets difficulty criteria)
 */
exports._isValidProof = (block) => {
  const hash = this._calculateHash(block);
  const difficultyPrefix = '0'.repeat(miningConfig.difficulty);
  return hash.startsWith(difficultyPrefix);
};
