const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  deleteDocument,
} = require("../controllers/documentController");

router.use(authMiddleware);

router.post("/", upload.single("document"), uploadDocument);

router.get("/", getAllDocuments);

router.get("/:id/download", downloadDocument);

router.get("/:id", getDocumentById);

router.delete("/:id", deleteDocument);

module.exports = router;