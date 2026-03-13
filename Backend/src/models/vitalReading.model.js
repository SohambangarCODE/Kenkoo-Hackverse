const mongoose = require("mongoose");

const VitalReadingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  heartRate: {
    type: Number,
    required: true,
  },
  hrv: {
    type: Number, // SDNN in ms
    default: 0,
  },
  stressLevel: {
    type: String,
    enum: ["Low", "Moderate", "High", "Unknown"],
    default: "Unknown",
  },
  signalQuality: {
    type: String,
    enum: ["Excellent", "Good", "Fair", "Poor"],
    default: "Poor",
  },
  circulationQuality: {
    type: String,
    enum: ["Good", "Fair", "Weak", "Unknown"],
    default: "Unknown",
  },
  scanType: {
    type: String,
    enum: ["finger", "face"],
    default: "finger",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("VitalReading", VitalReadingSchema);
