const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.config');
const walletRoutes = require('./modules/wallet/wallet.route');
const transactionRoutes = require('./modules/transaction/transaction.route');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions', transactionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MyCoin API',
    version: '1.0.0',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
