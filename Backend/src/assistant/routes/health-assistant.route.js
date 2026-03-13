const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const { analyzeHealth } = require("../controllers/health-assistant.controller");
const { protect } = require("../../middleware/auth.middleware");

// POST /api/assistant/analyze
// Protected route — requires auth token
// Accepts optional file upload (field name: "file")
router.post("/analyze", protect, upload.single("file"), analyzeHealth);

module.exports = router;
