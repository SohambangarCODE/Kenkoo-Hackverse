const express = require("express");
const router = express.Router();
const { saveReading, getReadings } = require("../controllers/vital.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, saveReading);
router.get("/", protect, getReadings);

module.exports = router;
