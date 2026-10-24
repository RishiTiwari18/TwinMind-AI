const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getAllDocuments,
  searchDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

// Require authentication for every document route
router.use(authMiddleware);

// Upload a document
router.post("/", upload.single("document"), uploadDocument);

// Get all documents belonging to the logged-in user
router.get("/", getAllDocuments);

// Search documents and return text snippets
router.get("/search", searchDocuments);

// Download the original document
router.get("/:id/download", downloadDocument);

// Get document details and extracted text
router.get("/:id", getDocumentById);

// Delete a document
router.delete("/:id", deleteDocument);

module.exports = router;