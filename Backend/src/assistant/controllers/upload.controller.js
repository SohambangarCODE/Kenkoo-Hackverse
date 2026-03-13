const fs = require("fs");
const extractText = require("../services/parser.service");
const { analyzeMedicalReport } = require("../services/ai.service");
const Record = require("../../models/record.model");

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // ✅ get optional user question
    const userPrompt = req.body.message || "";

    let text = "";
    try {
        text = await extractText(filePath);
    } catch (parseErr) {
        console.error("Text Extraction Failed:", parseErr);
        text = "Text extraction failed.";
    }

    // send both text + prompt to AI
    let analysis = {};
    try {
        analysis = await analyzeMedicalReport(text, req.body.question);
    } catch (aiError) {
        console.error("AI Analysis Failed:", aiError);
        // Fallback analysis object
        analysis = {
            title: "Uploaded Document",
            type: "Other",
            provider: "Unknown",
            date: null,
            summary: "AI analysis failed. Document uploaded successfully."
        };
    }

    // ✅ Read file and convert to Base64 for persistence on Render
    let fileBase64 = null;
    try {
        const fileBuffer = fs.readFileSync(filePath);
        fileBase64 = fileBuffer.toString('base64');
    } catch (fsErr) {
        console.error("File Read Failed:", fsErr);
    }

    // Create a new record in the database
    const newRecord = new Record({
      user: req.user._id, // Assumes protect middleware is used
      title: req.file.originalname, // Set title to original filename as requested 
      type: req.body.type || analysis.type || "Lab Report",     // Use manual type if provided, else AI, else default
      provider: analysis.provider || "Unknown Provider",
      date: analysis.date ? new Date(analysis.date) : Date.now(),
      fileUrl: `/uploads/${req.file.filename}`, 
      fileName: req.file.originalname,
      fileType: req.file.mimetype ? req.file.mimetype.split('/')[1] : "pdf", 
      fileData: fileBase64,
      fileMimeType: req.file.mimetype,
      analysis: analysis,
      metrics: analysis.metrics || [],
      recommendations: analysis.recommendations || [],
      summary: analysis.summary || "No summary available."
    });

    await newRecord.save();

    // Clean up local file after saving to DB to save space/be tidy
    try {
        fs.unlinkSync(filePath); 
    } catch (unlinkErr) {
        console.error("Cleanup failed:", unlinkErr);
    }

    res.json({
      success: true,
      result: analysis.answer_to_user || analysis.summary || "Analysis complete.",
      analysis,
      record: newRecord
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Processing failed", details: err.message });
  }
};

module.exports = uploadFile;
