const express = require("express");
const router = express.Router();
const { submitContact } = require("../controllers/contact.controller");

router.post("/submit", submitContact);

module.exports = router;
