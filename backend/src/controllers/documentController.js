const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");
const Document = require("../models/Document");

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/documents"
);

// Upload a document
async function uploadDocument(req, res, next) {
  let savedDocument;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document to upload",
      });
    }

    savedDocument = await Document.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: savedDocument,
    });
  } catch (error) {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }

    next(error);
  }
}

// Get all documents belonging to the logged-in user
async function getAllDocuments(req, res, next) {
  try {
    const documents = await Document.find({
      user: req.user.id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
}

// Get document metadata
async function getDocumentById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
}

// Download a document
async function downloadDocument(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const filePath = path.join(
      uploadDirectory,
      document.storedName
    );

    return res.download(
      filePath,
      document.originalName,
      (error) => {
        if (error && !res.headersSent) {
          next(error);
        }
      }
    );
  } catch (error) {
    next(error);
  }
}

// Delete a document and its stored file
async function deleteDocument(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const filePath = path.join(
      uploadDirectory,
      document.storedName
    );

    await fs.unlink(filePath);

    await Document.deleteOne({
      _id: document._id,
      user: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(500).json({
        success: false,
        message: "Stored file is missing; document metadata was not deleted",
      });
    }

    next(error);
  }
}

module.exports = {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
};