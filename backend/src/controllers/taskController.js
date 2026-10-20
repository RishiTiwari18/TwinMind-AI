const mongoose = require("mongoose");

const Task = require("../models/Task");
const Goal = require("../models/Goal");

// Validate a task title
function validateTitle(title) {
  return (
    typeof title === "string" &&
    title.trim().length >= 2 &&
    title.trim().length <= 150
  );
}

// Validate task description
function validateDescription(description) {
  return (
    typeof description === "string" &&
    description.length <= 2000
  );
}

// Validate task status
function isValidStatus(status) {
  return ["pending", "in-progress", "completed"].includes(status);
}

// Validate task priority
function isValidPriority(priority) {
  return ["low", "medium", "high"].includes(priority);
}

// Validate and normalize due date
function parseDueDate(value) {
  if (value === null || value === "") {
    return { valid: true, value: null };
  }

  if (typeof value !== "string") {
    return { valid: false };
  }

  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) {
    return { valid: false };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { valid: false };
  }

  return { valid: true, value: date };
}

// Verify that the selected goal belongs to the current user
async function validateGoalOwnership(goalId, userId) {
  // A task is allowed to exist without a linked goal.
  if (
    goalId === undefined ||
    goalId === null ||
    goalId === ""
  ) {
    return { valid: true, value: null };
  }

  // If a goal ID is supplied, validate its format.
  if (
    typeof goalId !== "string" ||
    !mongoose.isValidObjectId(goalId)
  ) {
    return {
      valid: false,
      message: "Invalid goal ID",
    };
  }

  // Ensure the goal belongs to the authenticated user.
  const goal = await Goal.findOne({
    _id: goalId,
    user: userId,
  });

  if (!goal) {
    return {
      valid: false,
      message: "Goal not found or does not belong to you",
    };
  }

  return {
    valid: true,
    value: goal._id,
  };
}

// CREATE TASK
async function createTask(req, res, next) {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      goalId,
    } = req.body;

    if (!validateTitle(title)) {
      return res.status(400).json({
        success: false,
        message: "Task title must contain between 2 and 150 characters",
      });
    }

    if (
      description !== undefined &&
      !validateDescription(description)
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string of at most 2000 characters",
      });
    }

    if (
      status !== undefined &&
      !isValidStatus(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    if (
      priority !== undefined &&
      !isValidPriority(priority)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid task priority",
      });
    }

    let normalizedDueDate = null;

    if (dueDate !== undefined) {
      const parsedDate = parseDueDate(dueDate);

      if (!parsedDate.valid) {
        return res.status(400).json({
          success: false,
          message: "Invalid due date. Use an ISO date string or null",
        });
      }

      normalizedDueDate = parsedDate.value;
    }

    const goalResult = await validateGoalOwnership(
      goalId,
      req.user.id
    );

    if (!goalResult.valid) {
      return res.status(400).json({
        success: false,
        message: goalResult.message,
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description:
        description === undefined ? "" : description.trim(),
      status: status || "pending",
      priority: priority || "medium",
      dueDate: normalizedDueDate,
      user: req.user.id,
      goal: goalResult.value,
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// GET ALL TASKS BELONGING TO THE CURRENT USER
async function getAllTasks(req, res, next) {
  try {
    const filter = {
      user: req.user.id,
    };

    if (req.query.status !== undefined) {
      if (!isValidStatus(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task status filter",
        });
      }

      filter.status = req.query.status;
    }

    if (req.query.priority !== undefined) {
      if (!isValidPriority(req.query.priority)) {
        return res.status(400).json({
          success: false,
          message: "Invalid task priority filter",
        });
      }

      filter.priority = req.query.priority;
    }

    if (req.query.goalId !== undefined) {
      if (!mongoose.isValidObjectId(req.query.goalId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid goal ID",
        });
      }

      const goal = await Goal.findOne({
        _id: req.query.goalId,
        user: req.user.id,
      });

      if (!goal) {
        return res.status(404).json({
          success: false,
          message: "Goal not found",
        });
      }

      filter.goal = goal._id;
    }

    const tasks = await Task.find(filter)
      .populate("goal", "title")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

// GET ONE TASK
async function getTaskById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("goal", "title");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE TASK
async function updateTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "goalId",
    ];

    const updates = {};
    const errors = [];

    for (const field of Object.keys(req.body)) {
      if (!allowedFields.includes(field)) {
        errors.push(`Field '${field}' cannot be updated`);
        continue;
      }

      const value = req.body[field];

      if (field === "title") {
        if (!validateTitle(value)) {
          errors.push("Task title must contain between 2 and 150 characters");
        } else {
          updates.title = value.trim();
        }
      }

      if (field === "description") {
        if (!validateDescription(value)) {
          errors.push("Description must be a string of at most 2000 characters");
        } else {
          updates.description = value.trim();
        }
      }

      if (field === "status") {
        if (!isValidStatus(value)) {
          errors.push("Invalid task status");
        } else {
          updates.status = value;
        }
      }

      if (field === "priority") {
        if (!isValidPriority(value)) {
          errors.push("Invalid task priority");
        } else {
          updates.priority = value;
        }
      }

      if (field === "dueDate") {
        const parsedDate = parseDueDate(value);

        if (!parsedDate.valid) {
          errors.push("Invalid due date. Use an ISO date string or null");
        } else {
          updates.dueDate = parsedDate.value;
        }
      }

      if (field === "goalId") {
        if (value === null || value === "") {
          updates.goal = null;
        } else if (
          typeof value !== "string" ||
          !mongoose.isValidObjectId(value)
        ) {
          errors.push("Invalid goal ID");
        } else {
          updates.goal = value;
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const existingTask = await Task.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "goalId")) {
      const goalResult = await validateGoalOwnership(
        req.body.goalId,
        req.user.id
      );

      if (!goalResult.valid) {
        return res.status(400).json({
          success: false,
          message: goalResult.message,
        });
      }

      updates.goal = goalResult.value;
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("goal", "title");

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE TASK
async function deleteTask(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID",
      });
    }

    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};