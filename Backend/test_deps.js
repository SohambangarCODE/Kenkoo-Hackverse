console.log("Loading pdf-parse...");
try {
    require("pdf-parse");
    console.log("pdf-parse loaded successfully.");
} catch (e) {
    console.error("Failed to load pdf-parse:", e);
}

console.log("Loading @langchain/google-genai...");
try {
    require("@langchain/google-genai");
    console.log("@langchain/google-genai loaded successfully.");
} catch (e) {
    console.error("Failed to load @langchain/google-genai:", e);
}
