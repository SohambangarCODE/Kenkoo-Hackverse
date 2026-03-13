const Record = require("../models/record.model");

// @desc    Get all records
// @route   GET /api/records
// @access  Private
const getRecords = async (req, res) => {
  try {
    const records = await Record.find({ user: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Delete a record
// @route   DELETE /api/records/:id
// @access  Private
const deleteRecord = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Check user
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    await record.deleteOne();

    res.json({ message: "Record removed" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    View a record file
// @route   GET /api/records/:id/view
// @access  Private
const viewFile = async (req, res) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Check user
    if (record.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (!record.fileData) {
      return res.status(404).json({ message: "File content missing from database" });
    }

    // Convert Base64 back to buffer
    const fileBuffer = Buffer.from(record.fileData, 'base64');

    // Set content type and send
    res.set('Content-Type', record.fileMimeType || 'application/pdf');
    res.send(fileBuffer);

  } catch (error) {
    console.error("Error viewing file:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Create a record programmatically (e.g. AI Report)
// @route   POST /api/records
// @access  Private
const createRecord = async (req, res) => {
  try {
    const { title, type, provider, fileData, fileMimeType, fileType, analysis, summary } = req.body;

    if (!title || !fileData) {
      return res.status(400).json({ message: "Title and fileData are required" });
    }

    const record = await Record.create({
      user: req.user._id,
      title,
      fileName: title,
      type: type || "AI Report",
      provider: provider || "Kenkoo AI Health Assistant",
      fileUrl: "/ai-report",
      fileData,
      fileMimeType: fileMimeType || "application/pdf",
      fileType: fileType || "pdf",
      analysis: analysis || null,
      summary: summary || "",
      date: new Date(),
    });

    res.status(201).json(record);
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getRecords,
  deleteRecord,
  viewFile,
  createRecord,
};
