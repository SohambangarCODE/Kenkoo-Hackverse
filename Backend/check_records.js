const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const mongoose = require("mongoose");
const Record = require("./src/models/record.model");

async function checkRecords() {
  await mongoose.connect(process.env.MONGO_URI);
  const records = await Record.find().sort({ createdAt: -1 }).limit(10);
  console.log("Latest records fileURLs:");
  records.forEach(r => {
    let exists = false;
    try {
      exists = require('fs').existsSync(require('path').join(__dirname, 'uploads', (r.fileUrl || '').replace('/uploads/', '')));
    } catch(e) {}
    console.log(`- ID: ${r._id}, fileName: ${r.fileName}, fileUrl: ${r.fileUrl}, exists: ${exists}`);
  });
  process.exit(0);
}
checkRecords();
