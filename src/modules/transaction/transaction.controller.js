const transactionService = require('./transaction.service');

class TransactionController {
  /**
   * Send coins from one address to another
   */
  async sendCoins(req, res) {
    try {
      const { fromAddress, toAddress, amount, privateKey } = req.body;

      // Validate required fields
      if (!fromAddress || !toAddress || !amount || !privateKey) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields',
        });
      }

      const transaction = await transactionService.sendCoins(
        fromAddress,
        toAddress,
        parseFloat(amount),
        privateKey,
      );

      return res.status(200).json({
        success: true,
        message: 'Transaction completed successfully',
        data: transaction,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(req, res) {
    try {
      const { address } = req.params;

      const transactions =
        await transactionService.getTransactionHistory(address);

      return res.status(200).json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Get all transactions in the blockchain with pagination
   */
  async getAllBlockchainTransactions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await transactionService.getAllBlockchainTransactions(
        page,
        limit,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error getting blockchain transactions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get blockchain transactions',
        error: error.message,
      });
    }
  }
}

module.exports = new TransactionController();
