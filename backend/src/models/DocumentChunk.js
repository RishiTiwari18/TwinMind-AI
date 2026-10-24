const mongoose = require("mongoose");

const documentChunkSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Source document is required"],
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },

    chunkIndex: {
      type: Number,
      required: [true, "Chunk index is required"],
      min: [0, "Chunk index cannot be negative"],
    },

    text: {
      type: String,
      required: [true, "Chunk text is required"],
      trim: true,
    },

    characterCount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

documentChunkSchema.index(
  { user: 1, document: 1, chunkIndex: 1 },
  { unique: true }
);

documentChunkSchema.index({
  user: 1,
  document: 1,
});

const DocumentChunk = mongoose.model(
  "DocumentChunk",
  documentChunkSchema
);

module.exports = DocumentChunk;