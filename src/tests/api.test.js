/**
 * API Testing Guide
 *
 * This file contains sample requests for testing the wallet and transaction API endpoints.
 * You can use these examples with tools like Postman, Insomnia, or curl.
 */

// Sample test data
const testData = {
  // Store created addresses, private keys here during testing
  wallet1: {
    address: null,
    privateKey: null,
    passphrase: null,
  },
  wallet2: {
    address: null,
    privateKey: null,
    passphrase: null,
  },
};

/**
 * 1. Create a new wallet (first wallet)
 *
 * POST /api/wallets
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "userId": "user123",
 *   "passphrase": "optional custom passphrase"  // Leave out to generate random one
 * }
 *
 * Expected response:
 * {
 *   "success": true,
 *   "message": "Wallet created successfully",
 *   "data": {
 *     "address": "...",
 *     "balance": 100,
 *     "passphrase": "..."
 *   }
 * }
 *
 * IMPORTANT: Save the address and passphrase for later tests!
 */

/**
 * 2. Create a second wallet for testing transactions
 *
 * POST /api/wallets
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "userId": "user456"
 * }
 *
 * Expected response: Similar to first wallet
 */

/**
 * 3. Get wallet statistics
 *
 * GET /api/wallets/:address/stats
 *
 * Replace :address with the wallet address from step 1
 *
 * Expected response:
 * {
 *   "success": true,
 *   "data": {
 *     "address": "...",
 *     "balance": 100,
 *     "createdAt": "..."
 *   }
 * }
 */

/**
 * 4. Send coins from wallet 1 to wallet 2
 *
 * POST /api/transactions/send
 * Content-Type: application/json
 *
 * Request body:
 * {
 *   "fromAddress": "wallet1_address",
 *   "toAddress": "wallet2_address",
 *   "amount": 25,
 *   "privateKey": "wallet1_private_key"
 * }
 *
 * Expected response:
 * {
 *   "success": true,
 *   "message": "Transaction completed successfully",
 *   "data": {
 *     // Transaction details
 *   }
 * }
 */

/**
 * 5. View transaction history for wallet 1
 *
 * GET /api/transactions/:address/history
 *
 * Replace :address with the wallet1 address
 *
 * Expected response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "...",
 *       "type": "SENT",
 *       "amount": 25,
 *       "withAddress": "wallet2_address",
 *       "timestamp": "...",
 *       "status": "CONFIRMED",
 *       "hash": "..."
 *     }
 *   ]
 * }
 */

/**
 * 6. Check wallet balances after transaction
 *
 * GET /api/wallets/:address/stats
 *
 * Do this for both wallet1 and wallet2 addresses
 *
 * Expected results:
 * - Wallet 1 should have 75 coins (100 - 25)
 * - Wallet 2 should have 125 coins (100 + 25)
 */
