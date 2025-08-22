const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
let wallet1 = null;
let wallet2 = null;

describe('Wallet and Transaction API Tests', () => {
  // Test creating wallets
  test('Should create first wallet', async () => {
    const response = await axios.post(`${API_URL}/wallets`, {
      userId: 'testUser1',
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('address');
    expect(response.data.data).toHaveProperty('balance');
    expect(response.data.data).toHaveProperty('passphrase');

    // Save wallet data for later tests
    wallet1 = {
      address: response.data.data.address,
      passphrase: response.data.data.passphrase,
    };

    // Get private key for transactions
    const walletDetails = await axios.get(
      `${API_URL}/wallets/${wallet1.address}/test`,
    );
    wallet1.privateKey = walletDetails.data.data.privateKey;
  });

  test('Should create second wallet', async () => {
    const response = await axios.post(`${API_URL}/wallets`, {
      userId: 'testUser2',
    });

    expect(response.status).toBe(201);
    expect(response.data.success).toBe(true);

    wallet2 = {
      address: response.data.data.address,
    };
  });

  // Test getting wallet statistics
  test('Should get wallet statistics', async () => {
    const response = await axios.get(
      `${API_URL}/wallets/${wallet1.address}/stats`,
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.data.address).toBe(wallet1.address);
    expect(response.data.data.balance).toBe(100); // Initial balance
  });

  // Test sending coins
  test('Should send coins from wallet1 to wallet2', async () => {
    const transferAmount = 25;

    const response = await axios.post(`${API_URL}/transactions/send`, {
      fromAddress: wallet1.address,
      toAddress: wallet2.address,
      amount: transferAmount,
      privateKey: wallet1.privateKey,
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.message).toBe('Transaction completed successfully');
  });

  // Test transaction history
  test('Should get transaction history for wallet', async () => {
    const response = await axios.get(
      `${API_URL}/transactions/${wallet1.address}/history`,
    );

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data.length).toBeGreaterThan(0);

    // Check first transaction
    const firstTx = response.data.data[0];
    expect(firstTx.type).toBe('SENT');
    expect(firstTx.withAddress).toBe(wallet2.address);
  });

  // Test balances after transaction
  test('Should verify wallet balances after transaction', async () => {
    // Check wallet1 balance
    const response1 = await axios.get(
      `${API_URL}/wallets/${wallet1.address}/stats`,
    );
    expect(response1.data.data.balance).toBe(75); // 100 - 25

    // Check wallet2 balance
    const response2 = await axios.get(
      `${API_URL}/wallets/${wallet2.address}/stats`,
    );
    expect(response2.data.data.balance).toBe(125); // 100 + 25
  });
});
