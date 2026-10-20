const mongoose = require("mongoose");
const Note = require("../models/Note");

const allowedCategories = [
  "personal",
  "work",
  "study",
  "ideas",
  "other",
];

function validateNoteFields(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate || body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      body.title.trim().length < 2 ||
      body.title.trim().length > 150
    ) {
      errors.push("Title must contain 2 to 150 characters");
    }
  }

  if (!isUpdate || body.content !== undefined) {
    if (
      typeof body.content !== "string" ||
      body.content.trim().length < 1 ||
      body.content.length > 20000
    ) {
      errors.push("Content must contain 1 to 20000 characters");
    }
  }

  if (body.category !== undefined) {
    if (
      typeof body.category !== "string" ||
      !allowedCategories.includes(body.category)
    ) {
      errors.push("Invalid note category");
    }
  }

  if (body.tags !== undefined) {
    if (
      !Array.isArray(body.tags) ||
      !body.tags.every(
        (tag) =>
          typeof tag === "string" &&
          tag.trim().length > 0 &&
          tag.trim().length <= 50
      )
    ) {
      errors.push("Tags must be an array of non-empty strings up to 50 characters each");
    }
  }

  return errors;
}

function isValidNoteId(id) {
  return mongoose.isValidObjectId(id);
}

// Create a note
async function createNote(req, res, next) {
  try {
    const errors = validateNoteFields(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const note = await Note.create({
      title: req.body.title.trim(),
      content: req.body.content.trim(),
      category: req.body.category || "other",
      tags: (req.body.tags || []).map((tag) => tag.trim()),
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

// Retrieve all notes belonging to the logged-in user
async function getAllNotes(req, res, next) {
  try {
    const filter = {
      user: req.user.id,
    };

    if (req.query.category !== undefined) {
      if (!allowedCategories.includes(req.query.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid note category",
        });
      }

      filter.category = req.query.category;
    }

    if (req.query.tag !== undefined) {
      const tag = req.query.tag.trim();

      if (!tag || tag.length > 50) {
        return res.status(400).json({
          success: false,
          message: "Invalid tag",
        });
      }

      filter.tags = tag;
    }

    const notes = await Note.find(filter).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    next(error);
  }
}

// Retrieve one note belonging to the logged-in user
async function getNoteById(req, res, next) {
  try {
    if (!isValidNoteId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

// Update a note
async function updateNote(req, res, next) {
  try {
    if (!isValidNoteId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const allowedFields = ["title", "content", "category", "tags"];
    const suppliedFields = Object.keys(req.body);

    const invalidFields = suppliedFields.filter(
      (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Unsupported fields: ${invalidFields.join(", ")}`,
      });
    }

    if (suppliedFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one field to update",
      });
    }

    const errors = validateNoteFields(req.body, true);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const updates = {};

    if (req.body.title !== undefined) {
      updates.title = req.body.title.trim();
    }

    if (req.body.content !== undefined) {
      updates.content = req.body.content.trim();
    }

    if (req.body.category !== undefined) {
      updates.category = req.body.category;
    }

    if (req.body.tags !== undefined) {
      updates.tags = req.body.tags.map((tag) => tag.trim());
    }

    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note,
    });
  } catch (error) {
    next(error);
  }
}

// Delete a note
async function deleteNote(req, res, next) {
  try {
    if (!isValidNoteId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid note ID",
      });
    }

    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
};