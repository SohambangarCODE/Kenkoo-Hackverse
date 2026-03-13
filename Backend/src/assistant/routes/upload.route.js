const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const uploadFile = require("../controllers/upload.controller");

const { protect } = require("../../middleware/auth.middleware");

router.post("/upload", protect, upload.single("file"), uploadFile);

module.exports = router;
