const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Note title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    content: {
      type: String,
      required: [true, "Note content is required"],
      trim: true,
      minlength: [1, "Note content cannot be empty"],
      maxlength: [20000, "Note content cannot exceed 20000 characters"],
    },

    category: {
      type: String,
      enum: ["personal", "work", "study", "ideas", "other"],
      default: "other",
    },

    tags: {
      type: [String],
      default: [],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Note owner is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ user: 1, updatedAt: -1 });

const Note = mongoose.model("Note", noteSchema);

module.exports = Note;