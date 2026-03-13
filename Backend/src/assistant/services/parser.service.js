
const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");
const Tesseract = require("tesseract.js");

const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  // ---------- PDF ----------
  if (ext === ".pdf") {
    const { PDFParse } = pdf;
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    return data.text;
  }

  // ---------- IMAGE ----------
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(m.status),
    });

    return result.data.text;
  }

  throw new Error("Unsupported file format");
};

module.exports = extractText;

