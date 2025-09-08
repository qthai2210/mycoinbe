const miningService = require('./mining.service');

/**
 * Set the mining address
 */
exports.setMiningAddress = async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Mining address is required',
      });
    }

    const result = await miningService.setMiningAddress(address);

    return res.status(200).json({
      success: true,
      message: 'Mining address set successfully',
      data: { address: result },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get mining status
 */
exports.getMiningStatus = async (req, res) => {
  try {
    const status = await miningService.getMiningStatus();

    return res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Set mining difficulty
 */
exports.setDifficulty = async (req, res) => {
  try {
    const { difficulty } = req.body;
    if (
      difficulty === undefined ||
      typeof difficulty !== 'number' ||
      difficulty < 1
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid difficulty value is required',
      });
    }

    const result = await miningService.setDifficulty(difficulty);

    return res.status(200).json({
      success: true,
      message: 'Difficulty updated successfully',
      data: { difficulty: result },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Start mining process
 */
exports.startMining = async (req, res) => {
  try {
    await miningService.startMining();

    return res.status(200).json({
      success: true,
      message: 'Mining started successfully',
      data: { mining: true },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Stop mining process
 */
exports.stopMining = async (req, res) => {
  try {
    await miningService.stopMining();

    return res.status(200).json({
      success: true,
      message: 'Mining stopped successfully',
      data: { mining: false },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Mine a single block (for testing)
 */
exports.mineBlock = async (req, res) => {
  try {
    const { minerAddress } = req.body;
    if (!minerAddress) {
      return res.status(400).json({
        success: false,
        message: 'Miner address is required',
      });
    }

    const block = await miningService.mineBlock(minerAddress);

    return res.status(200).json({
      success: true,
      message: 'Block mined successfully',
      data: block,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
