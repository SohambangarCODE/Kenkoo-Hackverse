const pdfParse = require("pdf-parse");
console.log("Type of pdfParse:", typeof pdfParse);
console.log("Is pdfParse a function?", typeof pdfParse === 'function');
console.log("Keys of pdfParse:", Object.keys(pdfParse));

// Test with dummy buffer
const dummyBuffer = Buffer.from("dummy pdf content");
try {
    pdfParse(dummyBuffer).then(data => {
        console.log("Parsed text:", data.text);
    }).catch(err => {
        console.error("Parse error:", err.message);
    });
} catch (e) {
    console.error("Execution error:", e.message);
}
