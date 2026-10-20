const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");

router.use(authMiddleware);

router.route("/")
  .post(createGoal)
  .get(getAllGoals);

router.route("/:id")
  .get(getGoalById)
  .patch(updateGoal)
  .delete(deleteGoal);

module.exports = router;