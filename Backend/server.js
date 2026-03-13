const dns = require("node:dns/promises");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
require("dotenv").config();
const path = require("path");
const app = require("./src/app");
const connectTODB = require("./src/config/database");

// SPA catch-all: serve index.html for any non-API route
// This must come AFTER all API routes are registered in app.js
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

connectTODB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server is running successfully on port ${PORT}`);
});
