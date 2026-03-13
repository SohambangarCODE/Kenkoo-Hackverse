const VitalReading = require("../models/vitalReading.model");

exports.saveReading = async (req, res) => {
  try {
    const { heartRate, hrv, stressLevel, signalQuality, circulationQuality, scanType } = req.body;

    if (!heartRate || heartRate < 30 || heartRate > 250) {
      return res.status(400).json({ message: "Invalid heart rate value" });
    }

    const reading = await VitalReading.create({
      user: req.user._id,
      heartRate,
      hrv: hrv || 0,
      stressLevel: stressLevel || "Unknown",
      signalQuality: signalQuality || "Poor",
      circulationQuality: circulationQuality || "Unknown",
      scanType: scanType || "finger",
    });

    res.status(201).json({ message: "Vital reading saved", reading });
  } catch (err) {
    console.error("Error saving vital reading:", err);
    res.status(500).json({ message: "Failed to save vital reading" });
  }
};

exports.getReadings = async (req, res) => {
  try {
    const readings = await VitalReading.find({ user: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(readings);
  } catch (err) {
    console.error("Error fetching vital readings:", err);
    res.status(500).json({ message: "Failed to fetch vital readings" });
  }
};
