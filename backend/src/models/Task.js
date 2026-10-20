const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [2, "Task title must contain at least 2 characters"],
      maxlength: [150, "Task title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    dueDate: {
      type: Date,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task owner is required"],
      index: true,
    },

    goal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, status: 1, createdAt: -1 });

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;