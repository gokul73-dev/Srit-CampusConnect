const mongoose = require("mongoose")

const eventSchema = new mongoose.Schema({

  title: String,

  clubName: String,

  location: String,

  description: String,

  startsAt: Date,

  maxParticipants: Number,

  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, {
  timestamps: true
})

module.exports = mongoose.model("Event", eventSchema)
