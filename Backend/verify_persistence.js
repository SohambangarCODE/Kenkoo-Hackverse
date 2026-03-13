const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");
const Record = require("./src/models/record.model");

async function checkLastRecord() {
  await mongoose.connect(process.env.MONGO_URI);
  const record = await Record.findOne().sort({ createdAt: -1 });
  if (record) {
    console.log("Latest record ID:", record._id);
    console.log("Has fileData:", !!record.fileData);
    if (record.fileData) {
      console.log("fileData length:", record.fileData.length);
      console.log("fileMimeType:", record.fileMimeType);
    }
  } else {
    console.log("No records found.");
  }
  process.exit(0);
}
checkLastRecord();
