const mongoose = require('mongoose');

const projectProgressSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    progressPercent: {
      type: Number,
      required: true,
    },
    updateText: String,

    media: [
      {
        type: String, // Cloudinary URL
      },
    ],

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },

    facultyFeedback: String,
  },
  { timestamps: true } // ✅ REQUIRED for "Updated: Feb 8, 2026"
);

module.exports = mongoose.model('ProjectProgress', projectProgressSchema);
