const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  searchDocuments,
} = require("../controllers/searchController");

router.use(authMiddleware);

router.get("/", searchDocuments);

module.exports = router;