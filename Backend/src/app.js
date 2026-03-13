const express = require('express')
const cors = require('cors')
const path = require("path");

const uploadRoutes = require("./assistant/routes/upload.route");
const chatRoutes = require("./assistant/routes/chat.route");
const healthAssistantRoutes = require("./assistant/routes/health-assistant.route");
const userRoutes = require("./routes/user.route");

const app = express()

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || origin === "https://photons-innovate.onrender.com" || origin === "https://kenkoo-morpheus.onrender.com") {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.static(path.join(__dirname, "../public")));

app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Serve static files from the Frontend app
// app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

app.use("/api/assistant", uploadRoutes);
app.use("/api/assistant", chatRoutes);
app.use("/api/assistant", healthAssistantRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/contact", require("./routes/contact.route"));
app.use("/api/health", require("./routes/health.route"));
app.use("/api/records", require("./routes/record.route"));
app.use("/api/vitals", require("./routes/vital.route"));

// Handle undefined API routes explicitly to avoid returning HTML
app.use("/api/*splat", (req, res) => {
    res.status(404).json({ message: "API route not found" });
});


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// app.get("/*splat", (req, res) => {
//   res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
// });

module.exports = app