const fs = require("fs");
const extractText = require("../services/parser.service");
const { analyzeHealthCondition } = require("../services/ai.service");

/**
 * POST /api/assistant/analyze
 * Accepts multipart form data with:
 *  - symptoms (string)
 *  - vitals (JSON string)
 *  - medicalHistory (JSON string)
 *  - language (string, optional)
 *  - file (optional upload — PDF, image, DOCX, etc.)
 */
const analyzeHealth = async (req, res) => {
  try {
    const { symptoms, vitals, medicalHistory, language } = req.body;

    if (!symptoms || symptoms.trim().length === 0) {
      return res.status(400).json({ error: "Symptoms are required for analysis." });
    }

    // Parse JSON strings sent from the frontend
    let parsedVitals = null;
    let parsedHistory = null;

    try {
      if (vitals) parsedVitals = JSON.parse(vitals);
    } catch {
      parsedVitals = null;
    }

    try {
      if (medicalHistory) parsedHistory = JSON.parse(medicalHistory);
    } catch {
      parsedHistory = null;
    }

    // Extract text from uploaded document if present
    let documentText = "";
    if (req.file) {
      try {
        documentText = await extractText(req.file.path);
      } catch (parseErr) {
        console.error("Document text extraction failed:", parseErr.message);
        documentText = "Document uploaded but text extraction failed.";
      }

      // Clean up uploaded file after extraction
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("File cleanup failed:", unlinkErr.message);
      }
    }

    // Run AI analysis
    const analysis = await analyzeHealthCondition({
      symptoms: symptoms.trim(),
      vitals: parsedVitals,
      medicalHistory: parsedHistory,
      documentText,
      language: language || "English",
    });

    res.json({
      success: true,
      analysis,
    });
  } catch (err) {
    console.error("HEALTH ANALYSIS ERROR:", err);
    res.status(500).json({
      error: "Health analysis failed",
      details: err.message,
    });
  }
};

module.exports = { analyzeHealth };
