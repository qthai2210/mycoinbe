const walletService = require('./wallet.service');
const bip39 = require('bip39');
const hdkey = require('hdkey');
const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');
const Wallet = require('../../models/wallet.model'); // Changed from './wallet.model'

/**
 * Helper function to encrypt private key
 * @param {string} privateKey - The private key to encrypt
 * @returns {string} - Encrypted private key
 */
function encryptPrivateKey(privateKey) {
  // Implement proper encryption using environment variables for keys
  // This is a placeholder - DO NOT use this in production
  const algorithm = 'aes-256-ctr';
  const secret =
    process.env.ENCRYPTION_KEY || 'your-secret-key-should-be-in-env';
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, secret, iv);
  const encrypted = Buffer.concat([cipher.update(privateKey), cipher.final()]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Helper function to decrypt private key
 * @param {string} encryptedKey - The encrypted private key
 * @returns {string} - Decrypted private key
 */
function decryptPrivateKey(encryptedKey) {
  // Implement proper decryption using environment variables for keys
  // This is a placeholder - DO NOT use this in production
  const algorithm = 'aes-256-ctr';
  const secret =
    process.env.ENCRYPTION_KEY || 'your-secret-key-should-be-in-env';

  const [ivHex, encryptedHex] = encryptedKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, secret, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString();
}

class WalletController {
  /**
   * Create a new wallet
   */
  async createWallet(req, res) {
    try {
      const { userId, passphrase } = req.body;
      const wallet = await walletService.createWallet(userId, passphrase);

      return res.status(201).json({
        success: true,
        message: 'Wallet created successfully',
        data: wallet,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(req, res) {
    try {
      const { address } = req.params;
      const stats = await walletService.getWalletStats(address);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get wallet with private key (FOR TESTING ONLY - would not be in production)
   */
  async getWalletWithPrivateKey(req, res) {
    try {
      const { address } = req.params;
      const wallet = await walletService.getWalletByAddress(address);

      return res.status(200).json({
        success: true,
        data: {
          address: wallet.address,
          privateKey: wallet.privateKey,
          publicKey: wallet.publicKey,
          balance: wallet.balance,
          passphrase: wallet.passphrase,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Generate a secret recovery phrase (mnemonic)
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async generateRecoveryPhrase(req, res) {
    try {
      const wordCount = req.body.wordCount || 12; // Default to 12 words if not specified

      // Map word counts to correct entropy values
      const entropyMap = {
        12: 128,
        15: 160,
        18: 192,
        21: 224,
        24: 256,
      };

      if (!entropyMap[wordCount]) {
        return res.status(400).json({
          success: false,
          message: 'Invalid word count. Must be 12, 15, 18, 21, or 24',
        });
      }

      // Generate mnemonic with correct entropy bits
      const mnemonic = bip39.generateMnemonic(entropyMap[wordCount]);
      const words = mnemonic.split(' ');

      // Format words with numbering
      const numberedWords = words.map((word, index) => ({
        number: index + 1,
        word,
      }));

      return res.status(200).json({
        success: true,
        data: {
          mnemonic,
          words: numberedWords,
          instructions: [
            'This is the recovery phrase for your wallet. You and you alone have access to it.',
            'It can be used to restore your wallet.',
            'Best practices for your recovery phrase are to write it down on paper and store it somewhere secure.',
            'Resist temptation to email it to yourself or screenshot it.',
          ],
        },
      });
    } catch (error) {
      console.error('Error generating recovery phrase:', error);
      return res.status(500).json({
        success: false,
        message: 'Error generating recovery phrase',
        error: error.message,
      });
    }
  }

  /**
   * Restore a wallet from a recovery phrase
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   */
  async restoreWallet(req, res) {
    try {
      const { userId, mnemonic } = req.body;

      // Validate required fields
      if (!userId || !mnemonic) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: userId and mnemonic',
        });
      }

      // Validate mnemonic phrase
      if (!bip39.validateMnemonic(mnemonic)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid recovery phrase',
        });
      }

      // Check if user already has a wallet
      const existingWallet = await Wallet.findOne({ userId });
      if (existingWallet) {
        return res.status(409).json({
          success: false,
          message: 'User already has a wallet',
        });
      }

      // Convert mnemonic to seed
      const seed = await bip39.mnemonicToSeed(mnemonic);

      // Create HD wallet from seed
      const hdwallet = hdkey.fromMasterSeed(seed);

      // Derive the first account using BIP44 path for Ethereum
      const path = "m/44'/60'/0'/0/0";
      const wallet = hdwallet.derive(path);

      // Get private key
      const privateKey = wallet.privateKey.toString('hex');

      // Get public address
      const publicKey = ethUtil.privateToPublic(wallet.privateKey);
      const address = '0x' + ethUtil.publicToAddress(publicKey).toString('hex');

      // Create a new wallet in database
      const newWallet = new Wallet({
        userId,
        address,
        // Store the private key securely, preferably encrypted
        privateKey: encryptPrivateKey(privateKey), // Implement encryption function
        balance: 100, // Default starting balance if applicable
      });

      await newWallet.save();

      return res.status(201).json({
        success: true,
        message: 'Wallet restored successfully',
        data: {
          address,
          balance: newWallet.balance,
        },
      });
    } catch (error) {
      console.error('Error restoring wallet:', error);
      return res.status(500).json({
        success: false,
        message: 'Error restoring wallet',
        error: error.message,
      });
    }
  }
}

module.exports = new WalletController();
