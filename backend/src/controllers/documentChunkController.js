const mongoose = require("mongoose");

const {
  getDocumentChunks,
} = require("../services/documentRetrievalService");

async function getChunksByDocument(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID",
      });
    }

    let limit = 50;
    let offset = 0;

    if (req.query.limit !== undefined) {
      if (
        typeof req.query.limit !== "string" ||
        !/^\d+$/.test(req.query.limit)
      ) {
        return res.status(400).json({
          success: false,
          message: "Limit must be a positive integer",
        });
      }

      limit = Number(req.query.limit);
    }

    if (req.query.offset !== undefined) {
      if (
        typeof req.query.offset !== "string" ||
        !/^\d+$/.test(req.query.offset)
      ) {
        return res.status(400).json({
          success: false,
          message: "Offset must be a non-negative integer",
        });
      }

      offset = Number(req.query.offset);
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    const result = await getDocumentChunks({
      documentId: id,
      userId: req.user.id,
      limit,
      offset,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getChunksByDocument,
};