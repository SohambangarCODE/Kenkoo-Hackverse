require("dotenv").config();
console.log("GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
console.log("MONGO_URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

if (process.env.GEMINI_API_KEY) {
    console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
}
if (process.env.MONGO_URI) {
    console.log("MONGO_URI length:", process.env.MONGO_URI.length);
}
