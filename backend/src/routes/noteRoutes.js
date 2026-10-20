const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} = require("../controllers/noteController");

router.use(authMiddleware);

router.route("/")
  .post(createNote)
  .get(getAllNotes);

router.route("/:id")
  .get(getNoteById)
  .patch(updateNote)
  .delete(deleteNote);

module.exports = router;