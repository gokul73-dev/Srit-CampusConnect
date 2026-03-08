const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: String,
    found: { type: Boolean, default: false }, // false = lost, true = found
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approved: { type: Boolean, default: false },
    attachments: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('LostFound', LostFoundSchema);
