const mongoose = require('mongoose');

const MiningConfigSchema = new mongoose.Schema(
  {
    miningAddress: {
      type: String,
      default: null,
    },
    difficulty: {
      type: Number,
      default: 4,
      min: 1,
    },
    mining: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Ensure only one config document exists
MiningConfigSchema.statics.getConfig = async function () {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('MiningConfig', MiningConfigSchema);
