const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({

  // =========================
  // BASIC INFO
  // =========================

  title: {
    type: String,
    required: true,
    trim: true
  },

  body: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    default: "General"
  },



  // =========================
  // IMAGE SUPPORT
  // =========================

  // single image (backward compatibility)
  image: {
    type: String,
    default: null
  },

  // multiple images (recommended)
  images: [
    {
      type: String
    }
  ],



  // =========================
  // AUTHOR INFO
  // =========================

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  createdByRole: {
    type: String,
    required: true
  },



  // =========================
  // VISIBILITY
  // =========================

  visibleTo: {
    type: String,
    enum: ["all", "students", "faculty", "clubhead"],
    default: "all"
  },

  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Club",
    default: null
  },



  // =========================
  // NOTICE CONTROL
  // =========================

  pinned: {
    type: Boolean,
    default: false
  },

  edited: {
    type: Boolean,
    default: false
  },



}, {
  timestamps: true
});

module.exports = mongoose.model("Notice", NoticeSchema);
