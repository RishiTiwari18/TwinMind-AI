const { searchDocumentChunks } = require("../services/searchService");

async function searchDocuments(req, res, next) {
  try {
    const { q, limit } = req.query;

    if (typeof q !== "string" || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: "A non-empty search query is required",
      });
    }

    let parsedLimit = 10;

    if (limit !== undefined) {
      if (typeof limit !== "string" || !/^\d+$/.test(limit)) {
        return res.status(400).json({
          success: false,
          message: "Limit must be a positive integer",
        });
      }

      parsedLimit = Number(limit);
    }

    if (parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 50",
      });
    }

    const result = await searchDocumentChunks({
      query: q,
      userId: req.user.id,
      limit: parsedLimit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  searchDocuments,
};