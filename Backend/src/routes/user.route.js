const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const upload = require("../assistant/middleware/upload.middleware");

router.get("/", protect, userController.getProfile);
router.put("/", protect, userController.updateProfile);
router.post("/upload-photo", protect, upload.single("profileImage"), userController.uploadProfileImage);

module.exports = router;
