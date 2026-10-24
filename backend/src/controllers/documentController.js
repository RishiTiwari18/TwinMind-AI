const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const Document = require("../models/Document");
const extractDocumentText = require("../utils/extractDocumentText");

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/documents"
);

// Upload a document and extract its text
async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select a document to upload",
      });
    }

    const extractedText = await extractDocumentText(
      req.file.path,
      req.file.mimetype
    );

    const savedDocument = await Document.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
      user: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and text extracted successfully",
      data: {
        id: savedDocument._id,
        originalName: savedDocument.originalName,
        mimeType: savedDocument.mimeType,
        size: savedDocument.size,
        textLength: savedDocument.extractedText.length,
        extractedText: savedDocument.extractedText,
        createdAt: savedDocument.createdAt,
      },
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
    })
      .select("-extractedText")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
}

// Search documents and return a matching text snippet
async function searchDocuments(req, res, next) {
  try {
    const query = req.query.q;

    if (typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a search query using the q parameter",
      });
    }

    const searchTerm = query.trim();

    if (searchTerm.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Search query cannot exceed 100 characters",
      });
    }

    let limit = 10;

    if (req.query.limit !== undefined) {
      const rawLimit = req.query.limit;

      if (
        typeof rawLimit !== "string" ||
        !/^\d+$/.test(rawLimit)
      ) {
        return res.status(400).json({
          success: false,
          message: "Limit must be a positive integer",
        });
      }

      limit = Number(rawLimit);

      if (limit < 1 || limit > 50) {
        return res.status(400).json({
          success: false,
          message: "Limit must be between 1 and 50",
        });
      }
    }

    // Escape regex special characters in the search term
    const escapedQuery = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    // Find only the current user's matching documents
    const documents = await Document.find({
      user: req.user.id,
      $or: [
        {
          originalName: {
            $regex: escapedQuery,
            $options: "i",
          },
        },
        {
          extractedText: {
            $regex: escapedQuery,
            $options: "i",
          },
        },
      ],
    })
      .select("-extractedText")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // Build a short preview around the matching text
    const results = await Promise.all(
      documents.map(async (document) => {
        let snippet = "";

        // Search inside the original filename first
        const filenameMatch = document.originalName
          .toLowerCase()
          .indexOf(searchTerm.toLowerCase());

        if (filenameMatch !== -1) {
          snippet = document.originalName;
        } else {
          // Retrieve the extracted text for snippet generation
          const fullDocument = await Document.findOne({
            _id: document._id,
            user: req.user.id,
          }).select("extractedText");

          const text = fullDocument?.extractedText || "";
          const matchIndex = text
            .toLowerCase()
            .indexOf(searchTerm.toLowerCase());

          if (matchIndex !== -1) {
            const contextLength = 60;

            const start = Math.max(
              0,
              matchIndex - contextLength
            );

            const end = Math.min(
              text.length,
              matchIndex + searchTerm.length + contextLength
            );

            snippet =
              (start > 0 ? "..." : "") +
              text.slice(start, end) +
              (end < text.length ? "..." : "");
          }
        }

        return {
          id: document._id,
          originalName: document.originalName,
          mimeType: document.mimeType,
          size: document.size,
          createdAt: document.createdAt,
          snippet,
        };
      })
    );

    return res.status(200).json({
      success: true,
      query: searchTerm,
      count: results.length,
      limit,
      data: results,
    });
  } catch (error) {
    next(error);
  }
}

// Get one document and its extracted text
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

// Download the original document
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
        message:
          "Stored file is missing; document metadata was not deleted",
      });
    }

    next(error);
  }
}

module.exports = {
  uploadDocument,
  getAllDocuments,
  searchDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
};