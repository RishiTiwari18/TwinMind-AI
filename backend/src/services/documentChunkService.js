const DocumentChunk = require("../models/DocumentChunk");
const chunkText = require("../utils/chunkText");

async function saveDocumentChunks({ text, documentId, userId }) {
  if (!documentId || !userId) {
    throw new Error("Document ID and user ID are required");
  }

  if (typeof text !== "string") {
    throw new TypeError("Document text must be a string");
  }

  const chunks = chunkText(text);

  if (chunks.length === 0) {
    return {
      totalChunks: 0,
      message: "No extractable text was found",
    };
  }

  const chunkDocuments = chunks.map((chunk) => ({
    document: documentId,
    user: userId,
    chunkIndex: chunk.index,
    text: chunk.text,
    characterCount: chunk.text.length,
  }));

  await DocumentChunk.insertMany(chunkDocuments, {
    ordered: true,
  });

  return {
    totalChunks: chunkDocuments.length,
    message: "Document chunks saved successfully",
  };
}

async function deleteDocumentChunks({ documentId, userId }) {
  if (!documentId || !userId) {
    throw new Error("Document ID and user ID are required");
  }

  const result = await DocumentChunk.deleteMany({
    document: documentId,
    user: userId,
  });

  return {
    deletedChunks: result.deletedCount,
  };
}

module.exports = {
  saveDocumentChunks,
  deleteDocumentChunks,
};