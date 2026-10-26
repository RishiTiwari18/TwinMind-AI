const fs = require("fs/promises");
const path = require("path");
const mongoose = require("mongoose");

const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");
const extractDocumentText = require("../utils/extractDocumentText");

const {
  saveDocumentChunks,
  deleteDocumentChunks,
} = require("../services/documentChunkService");

const uploadDirectory = path.resolve(
  __dirname,
  "../../uploads/documents"
);

// Upload a document, extract text, and save its chunks
async function uploadDocument(req, res, next) {
  let savedDocument = null;

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

    savedDocument = await Document.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
      user: req.user.id,
    });

    const chunkResult = await saveDocumentChunks({
      text: extractedText,
      documentId: savedDocument._id,
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",
      data: {
        id: savedDocument._id,
        originalName: savedDocument.originalName,
        mimeType: savedDocument.mimeType,
        size: savedDocument.size,
        textLength: savedDocument.extractedText.length,
        totalChunks: chunkResult.totalChunks,
        extractedText: savedDocument.extractedText,
        createdAt: savedDocument.createdAt,
      },
    });
  } catch (error) {
    // If the document was saved but chunk creation failed,
    // remove the partially created database records.
    if (savedDocument) {
      await DocumentChunk.deleteMany({
        document: savedDocument._id,
        user: req.user.id,
      }).catch((cleanupError) => {
        console.error(
          "Failed to clean up document chunks:",
          cleanupError.message
        );
      });

      await Document.deleteOne({
        _id: savedDocument._id,
        user: req.user.id,
      }).catch((cleanupError) => {
        console.error(
          "Failed to clean up document metadata:",
          cleanupError.message
        );
      });
    }

    // Remove the uploaded file if it exists.
    if (req.file) {
      await fs.unlink(req.file.path).catch((cleanupError) => {
        if (cleanupError.code !== "ENOENT") {
          console.error(
            "Failed to clean up uploaded file:",
            cleanupError.message
          );
        }
      });
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
        message: "Please provide a search query using the q parameter",
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

    const escapedQuery = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

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

    const results = await Promise.all(
      documents.map(async (document) => {
        let snippet = "";

        const filenameMatch = document.originalName
          .toLowerCase()
          .indexOf(searchTerm.toLowerCase());

        if (filenameMatch !== -1) {
          snippet = document.originalName;
        } else {
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

// Delete a document, its chunks, and its stored file
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

    // Verify the original file exists before deleting database records.
    await fs.access(filePath);

    // Remove the document's chunks first.
    await deleteDocumentChunks({
      documentId: document._id,
      userId: req.user.id,
    });

    // Delete the document metadata.
    const deleteResult = await Document.deleteOne({
      _id: document._id,
      user: req.user.id,
    });

    if (deleteResult.deletedCount !== 1) {
      return res.status(409).json({
        success: false,
        message: "Document could not be deleted",
      });
    }

    // Remove the original uploaded file.
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      console.error(
        "Document was deleted from MongoDB, but its file could not be removed:",
        fileError.message
      );

      return res.status(200).json({
        success: true,
        message:
          "Document and chunks deleted, but the stored file needs cleanup",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Document and its chunks deleted successfully",
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(500).json({
        success: false,
        message:
          "Stored file is missing; document and chunks were not deleted",
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