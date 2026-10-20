const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(authMiddleware);

router.route("/")
  .post(createTask)
  .get(getAllTasks);

router.route("/:id")
  .get(getTaskById)
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;