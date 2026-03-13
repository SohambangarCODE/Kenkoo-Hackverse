const pdfParse = require("pdf-parse");
const fs = require('fs');

async function test() {
    try {
        const { PDFParse } = pdfParse;
        if (PDFParse) {
            console.log("PDFParse class found.");

            // Create a dummy PDF buffer (or try empty buffer if it accepts it for testing API)
            // But better to use the test.pdf created earlier
            // If test.pdf exists
            if (fs.existsSync('test.pdf')) {
                const buffer = fs.readFileSync('test.pdf');
                console.log("Buffer size:", buffer.length);

                // Correct usage inferred from source:
                const parser = new PDFParse({ data: buffer });
                console.log("Instance created.");
                const result = await parser.getText();
                console.log("Text content preview:", result.text.substring(0, 100));

            } else {
                console.log("test.pdf not found, creating one...");
                // ... logic to create ... but let's assume it exists from previous step
            }
        }
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
