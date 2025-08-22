# Manual Testing Guide for Wallet Features

This guide contains cURL commands to test the wallet and transaction features.

## Prerequisites

- Ensure your server is running: `npm run dev`
- Default server address in these examples is `http://localhost:3000`

## Testing Steps

### 1. Create First Wallet

```bash
curl -X POST http://localhost:3000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'
```

**Save the response data (address, privateKey, passphrase) for later steps!**

### 2. Create Second Wallet

```bash
curl -X POST http://localhost:3000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId": "user456"}'
```

**Save the response data for this wallet too!**

### 3. Check Wallet Statistics (Balance)

```bash
curl -X GET http://localhost:3000/api/wallets/YOUR_WALLET_ADDRESS/stats
```

Replace `YOUR_WALLET_ADDRESS` with the address from step 1.

### 4. Send Coins Between Wallets

```bash
curl -X POST http://localhost:3000/api/transactions/send \
  -H "Content-Type: application/json" \
  -d '{
    "fromAddress": "WALLET1_ADDRESS",
    "toAddress": "WALLET2_ADDRESS",
    "amount": 25,
    "privateKey": "WALLET1_PRIVATE_KEY"
  }'
```

Replace the placeholders with actual values from steps 1 and 2.

### 5. View Transaction History

```bash
curl -X GET http://localhost:3000/api/transactions/WALLET_ADDRESS/history
```

Replace `WALLET_ADDRESS` with either wallet address to see its transaction history.

### 6. Verify Balances After Transaction

```bash
curl -X GET http://localhost:3000/api/wallets/WALLET1_ADDRESS/stats
curl -X GET http://localhost:3000/api/wallets/WALLET2_ADDRESS/stats
```

Verify that:

- Wallet 1 balance decreased by the sent amount
- Wallet 2 balance increased by the sent amount
