const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    default: "Medical Record",
  },
  fileName: {
    type: String,
    required: false,
  },
  type: {
    type: String,
    enum: ["Lab Report", "Prescription", "Scan", "Bill", "AI Report", "Other"],
    default: "Other",
  },
  provider: {
    type: String,
    default: "Unknown Provider",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: {
    type: String, // e.g. "pdf", "jpg"
  },
  fileData: {
    type: String, // Base64 encoded file data
    required: false,
  },
  fileMimeType: {
    type: String,
    required: false,
  },
  analysis: {
    type: Object, // Store the AI analysis result here
  },
  metrics: [
    {
      name: { type: String },
      value: { type: Number },
      unit: { type: String },
      status: { type: String }
    }
  ],
  recommendations: [
    { type: String }
  ],
  summary: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Record", RecordSchema);
