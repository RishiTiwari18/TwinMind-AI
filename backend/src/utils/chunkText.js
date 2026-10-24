function chunkText(text, options = {}) {
  if (typeof text !== "string") {
    throw new TypeError("Text must be a string");
  }

  const chunkSize = options.chunkSize ?? 1000;
  const overlap = options.overlap ?? 150;

  if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
    throw new Error("Chunk size must be a positive integer");
  }

  if (
    !Number.isInteger(overlap) ||
    overlap < 0 ||
    overlap >= chunkSize
  ) {
    throw new Error(
      "Overlap must be a non-negative integer smaller than chunk size"
    );
  }

  const normalizedText = text.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    return [];
  }

  const chunks = [];
  const step = chunkSize - overlap;

  for (
    let start = 0;
    start < normalizedText.length;
    start += step
  ) {
    const chunk = normalizedText
      .slice(start, start + chunkSize)
      .trim();

    if (chunk) {
      chunks.push({
        index: chunks.length,
        text: chunk,
      });
    }
  }

  return chunks;
}

module.exports = chunkText;