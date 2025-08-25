const crypto = require('crypto');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const bip39 = require('bip39');
const hdkey = require('hdkey');

/**
 * Generate a new wallet with private key, public key, and address
 * @param {String} passphrase Optional user-provided passphrase
 * @returns {Object} Wallet keys and address
 */
const generateWallet = (passphrase = null) => {
  // Generate mnemonic phrase if no passphrase provided
  const mnemonic = passphrase || bip39.generateMnemonic(256);
  const seed = bip39.mnemonicToSeedSync(mnemonic);

  // Derive keys using HD wallet derivation path for Bitcoin (can be customized)
  const hdwallet = hdkey.fromMasterSeed(seed);
  const path = "m/44'/0'/0'/0/0"; // BIP44 standard path
  const child = hdwallet.derive(path);

  // Get private/public key pair
  const privateKeyBuffer = child.privateKey;
  const privateKey = privateKeyBuffer.toString('hex');

  // Get key pair from private key
  const keyPair = ec.keyFromPrivate(privateKey);
  const publicKey = keyPair.getPublic('hex');

  // Generate address from public key
  const address =
    // '0x' +
    crypto
      .createHash('sha256')
      .update(publicKey)
      .digest('hex')
      .substring(0, 40); // Take first 40 chars after '0x' prefix

  return {
    privateKey, // This must be the raw private key
    publicKey,
    address: '0x' + address, // Make sure address has 0x prefix
    passphrase: mnemonic,
  };
};

/**
 * Create a signature for transaction data using private key
 */
const signTransaction = (privateKey, transactionData) => {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(transactionData))
    .digest('hex');

  const keyPair = ec.keyFromPrivate(privateKey);
  const signature = keyPair.sign(hash);

  return {
    signature: signature.toDER('hex'),
    hash,
  };
};

/**
 * Verify a transaction signature
 */
const verifySignature = (publicKey, transactionData, signature) => {
  const hash = crypto
    .createHash('sha256')
    .update(JSON.stringify(transactionData))
    .digest('hex');

  const keyPair = ec.keyFromPublic(publicKey, 'hex');
  return keyPair.verify(hash, signature);
};

module.exports = {
  generateWallet,
  signTransaction,
  verifySignature,
};
