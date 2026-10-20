const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
      trim: true,
      maxlength: [255, "Filename cannot exceed 255 characters"],
    },

    storedName: {
      type: String,
      required: true,
      unique: true,
    },

    mimeType: {
      type: String,
      required: true,
      enum: [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    },

    size: {
      type: Number,
      required: true,
      min: [1, "File size must be greater than zero"],
      max: [5 * 1024 * 1024, "File cannot exceed 5 MiB"],
    },

    extractedText: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Document owner is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ user: 1, createdAt: -1 });

const Document = mongoose.model("Document", documentSchema);

module.exports = Document;