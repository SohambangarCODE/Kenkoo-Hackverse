const express = require("express");
const router = express.Router();
const { getInsights } = require("../controllers/health.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/insights", protect, getInsights);

module.exports = router;
