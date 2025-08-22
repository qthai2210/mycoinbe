const Transaction = require('../../models/transaction.model');
const Wallet = require('../../models/wallet.model');
const { signTransaction, verifySignature } = require('../../utils/crypto');
const ProofOfWork = require('../../utils/proofOfWork');

class TransactionService {
  /**
   * Send coins from one address to another
   */
  async sendCoins(fromAddress, toAddress, amount, privateKey) {
    try {
      // Verify sender wallet exists
      const senderWallet = await Wallet.findOne({ address: fromAddress });
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      // Verify receiver wallet exists
      const receiverWallet = await Wallet.findOne({ address: toAddress });
      if (!receiverWallet) {
        throw new Error('Receiver wallet not found');
      }

      // Check if sender has enough balance
      if (senderWallet.balance < amount) {
        throw new Error('Insufficient funds');
      }

      // Create transaction data
      const transactionData = {
        fromAddress,
        toAddress,
        amount,
        timestamp: Date.now(),
      };

      // Sign transaction
      const { signature, hash } = signTransaction(privateKey, transactionData);

      // Verify the signature using the sender's public key
      const isValid = verifySignature(
        senderWallet.publicKey,
        transactionData,
        signature,
      );
      if (!isValid) {
        throw new Error('Invalid signature');
      }

      // Use Proof of Work to add some mining complexity
      const pow = new ProofOfWork(4); // difficulty level 4
      const { nonce, hash: powHash } = pow.mine({ ...transactionData, hash });

      // Create and save transaction
      const transaction = new Transaction({
        fromAddress,
        toAddress,
        amount,
        hash: powHash,
        status: 'CONFIRMED',
      });

      await transaction.save();

      // Update wallet balances
      senderWallet.balance -= amount;
      receiverWallet.balance += amount;

      await senderWallet.save();
      await receiverWallet.save();

      return transaction;
    } catch (error) {
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(address) {
    try {
      // Find all transactions where this address is either sender or receiver
      const transactions = await Transaction.find({
        $or: [{ fromAddress: address }, { toAddress: address }],
      }).sort({ timestamp: -1 }); // Sort by most recent first

      return transactions.map((tx) => {
        const isOutgoing = tx.fromAddress === address;

        return {
          id: tx._id,
          type: isOutgoing ? 'SENT' : 'RECEIVED',
          amount: tx.amount,
          withAddress: isOutgoing ? tx.toAddress : tx.fromAddress,
          timestamp: tx.timestamp,
          status: tx.status,
          hash: tx.hash,
        };
      });
    } catch (error) {
      throw new Error(`Error getting transaction history: ${error.message}`);
    }
  }
}

module.exports = new TransactionService();
