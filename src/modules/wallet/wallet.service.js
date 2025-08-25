const Wallet = require('../../models/wallet.model');
const { generateWallet } = require('../../utils/crypto');

class WalletService {
  /**
   * Create a new wallet
   * @param {String} userId User who owns the wallet
   * @param {String} passphrase Optional passphrase
   */
  async createWallet(userId, passphrase = null) {
    try {
      // Generate new wallet cryptographic material
      const walletData = generateWallet(passphrase);

      // Save wallet to database
      const wallet = new Wallet({
        address: walletData.address,
        privateKey: walletData.privateKey, // Make sure private key is stored
        publicKey: walletData.publicKey,
        passphrase: walletData.passphrase,
        userId: userId || null,
        balance: 100, // Give initial coins for testing
      });

      await wallet.save();

      // Return the complete wallet data including the private key
      return {
        address: wallet.address,
        balance: wallet.balance,
        passphrase: wallet.passphrase,
        privateKey: walletData.privateKey, // Return the unencrypted private key
        publicKey: wallet.publicKey,
        userId: wallet.userId,
        createdAt: wallet.createdAt,
      };
    } catch (error) {
      throw new Error(`Error creating wallet: ${error.message}`);
    }
  }

  /**
   * Get wallet by address
   */
  async getWalletByAddress(address) {
    try {
      const wallet = await Wallet.findOne({ address });
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      return wallet;
    } catch (error) {
      throw new Error(`Error getting wallet: ${error.message}`);
    }
  }

  /**
   * Get wallet statistics (balance)
   */
  async getWalletStats(address) {
    try {
      const wallet = await Wallet.findOne({ address });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      return {
        address: wallet.address,
        balance: wallet.balance,
        createdAt: wallet.createdAt,
      };
    } catch (error) {
      throw new Error(`Error getting wallet statistics: ${error.message}`);
    }
  }

  /**
   * Update wallet balance
   */
  async updateBalance(address, amount) {
    try {
      const wallet = await Wallet.findOne({ address });
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      wallet.balance = amount;
      await wallet.save();
      return wallet;
    } catch (error) {
      throw new Error(`Error updating balance: ${error.message}`);
    }
  }
}

module.exports = new WalletService();
