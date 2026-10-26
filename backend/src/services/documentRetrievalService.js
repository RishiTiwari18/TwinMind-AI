const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");

async function getDocumentChunks({
  documentId,
  userId,
  limit = 50,
  offset = 0,
}) {
  if (!documentId || !userId) {
    throw new Error("Document ID and user ID are required");
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("Limit must be between 1 and 100");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error("Offset must be a non-negative integer");
  }

  const document = await Document.findOne({
    _id: documentId,
    user: userId,
  })
    .select("_id originalName")
    .lean();

  if (!document) {
    return null;
  }

  const [chunks, totalChunks] = await Promise.all([
    DocumentChunk.find({
      document: documentId,
      user: userId,
    })
      .sort({ chunkIndex: 1 })
      .skip(offset)
      .limit(limit)
      .select("chunkIndex text characterCount")
      .lean(),

    DocumentChunk.countDocuments({
      document: documentId,
      user: userId,
    }),
  ]);

  return {
    document,
    chunks,
    totalChunks,
    limit,
    offset,
  };
}

module.exports = {
  getDocumentChunks,
};