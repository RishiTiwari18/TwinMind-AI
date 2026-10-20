const fs = require("fs/promises");
const path = require("path");
const mammoth = require("mammoth");
const { PDFParse } = require("pdf-parse");

async function extractDocumentText(filePath, mimeType) {
  const extension = path.extname(filePath).toLowerCase();

  // Extract text from TXT files
  if (extension === ".txt" && mimeType === "text/plain") {
    return fs.readFile(filePath, "utf8");
  }

  // Extract text from DOCX files
  if (
    extension === ".docx" &&
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      path: filePath,
    });

    return result.value.trim();
  }

  // Extract text from PDF files
  if (extension === ".pdf" && mimeType === "application/pdf") {
    const parser = new PDFParse({
      data: await fs.readFile(filePath),
    });

    try {
      const result = await parser.getText();
      return result.text.trim();
    } finally {
      await parser.destroy();
    }
  }

  throw new Error("Unsupported document type");
}

module.exports = extractDocumentText;