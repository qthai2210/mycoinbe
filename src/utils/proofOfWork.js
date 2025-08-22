const crypto = require('crypto');

class ProofOfWork {
  constructor(difficulty = 4) {
    // Difficulty defines the number of leading zeros required
    this.difficulty = difficulty;
    this.target = '0'.repeat(difficulty);
  }

  // Mine a block by finding a nonce that creates a hash with leading zeros
  mine(blockData) {
    let nonce = 0;
    let hash = '';

    console.log('Mining block...');

    while (true) {
      // Create hash of block data + nonce
      hash = this.calculateHash(blockData, nonce);

      // Check if hash meets difficulty target
      if (hash.substring(0, this.difficulty) === this.target) {
        console.log(`Block mined: ${hash}`);
        return { nonce, hash };
      }

      nonce++;

      // Log progress occasionally to show mining is working
      if (nonce % 100000 === 0) {
        console.log(`Still mining... nonce: ${nonce}, hash: ${hash}`);
      }
    }
  }

  // Calculate hash with SHA-256
  calculateHash(blockData, nonce) {
    const data = JSON.stringify(blockData) + nonce;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Verify that a block was mined properly
  verify(blockData, nonce, hash) {
    // Check if provided hash matches calculated hash
    const calculatedHash = this.calculateHash(blockData, nonce);
    if (calculatedHash !== hash) {
      return false;
    }

    // Check if hash meets difficulty target
    return hash.substring(0, this.difficulty) === this.target;
  }
}

module.exports = ProofOfWork;
