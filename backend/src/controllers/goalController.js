const mongoose = require("mongoose");

const Goal = require("../models/Goal");

const { validateCreateGoal } = require("../utils/goalValidation");

// CREATE a goal belonging to the logged-in user
async function createGoal(req, res, next) {
  try {
    const errors = validateCreateGoal(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const goal = await Goal.create({
      title: req.body.title,
      description: req.body.description,
      targetDays: req.body.targetDays,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

// READ goals belonging only to the logged-in user
async function getAllGoals(req, res, next) {
  try {
    const filter = {
      user: req.user.id,
    };

    if (req.query.completed !== undefined) {
      if (!["true", "false"].includes(req.query.completed)) {
        return res.status(400).json({
          success: false,
          message: "The completed query parameter must be true or false",
        });
      }

      filter.completed = req.query.completed === "true";
    }

    const goals = await Goal.find(filter).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: goals.length,
      data: goals,
    });
  } catch (error) {
    next(error);
  }
}

// READ one goal only if the logged-in user owns it
async function getGoalById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

// UPDATE a goal only if the logged-in user owns it
async function updateGoal(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const allowedFields = [
      "title",
      "description",
      "targetDays",
      "completed",
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
        if (typeof value !== "string" || value.trim() === "") {
          errors.push("Goal title must be a non-empty string");
        } else {
          updates.title = value.trim();
        }
      }

      if (field === "description") {
        if (typeof value !== "string") {
          errors.push("Description must be a string");
        } else {
          updates.description = value.trim();
        }
      }

      if (field === "targetDays") {
        if (!Number.isInteger(value) || value < 1) {
          errors.push("targetDays must be a positive integer");
        } else {
          updates.targetDays = value;
        }
      }

      if (field === "completed") {
        if (typeof value !== "boolean") {
          errors.push("completed must be true or false");
        } else {
          updates.completed = value;
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
        message: "Provide at least one valid field to update",
      });
    }

    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

// DELETE a goal only if the logged-in user owns it
async function deleteGoal(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal ID",
      });
    }

    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Goal deleted successfully",
      data: goal,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
};