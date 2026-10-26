const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getChunksByDocument,
} = require("../controllers/documentChunkController");

router.use(authMiddleware);

router.get("/:id", getChunksByDocument);

module.exports = router;