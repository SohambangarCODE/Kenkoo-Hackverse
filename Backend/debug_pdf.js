const pdfParse = require("pdf-parse");
console.log("Type of pdfParse:", typeof pdfParse);
console.log("pdfParse value:", pdfParse);
try {
    if (typeof pdfParse === 'function') {
        console.log("It is a function.");
    } else {
        console.log("It is NOT a function.");
    }
} catch (e) {
    console.error(e);
}
