const crypto = require('crypto');
const mongoose = require('mongoose');

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
  // First, add mining reward transaction
  const rewardTx = {
    fromAddress: null, // null means it's a mining reward
    toAddress: minerAddress,
    amount: 50, // Mining reward
    timestamp: Date.now(),
    hash: crypto.randomBytes(32).toString('hex'),
  };

  // Add reward to pending transactions
  blockchain.pendingTransactions.push(rewardTx);

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

  // Add the new block to the chain
  blockchain.chain.push(validBlock);

  // Clear pending transactions
  blockchain.pendingTransactions = [];

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
