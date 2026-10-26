const DocumentChunk = require("../models/DocumentChunk");

async function searchDocumentChunks({ query, userId, limit = 10 }) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (typeof query !== "string" || !query.trim()) {
    throw new Error("Search query is required");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new Error("Limit must be between 1 and 50");
  }

  const searchTerms = query
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const escapedTerms = searchTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const searchPattern = escapedTerms.join("|");

  const results = await DocumentChunk.find({
    user: userId,
    text: {
      $regex: searchPattern,
      $options: "i",
    },
  })
    .sort({ createdAt: -1, _id: 1 })
    .limit(limit)
    .select("document chunkIndex text characterCount createdAt")
    .populate("document", "originalName")
    .lean();

  return {
    query: query.trim(),
    totalResults: results.length,
    results,
  };
}

module.exports = {
  searchDocumentChunks,
};