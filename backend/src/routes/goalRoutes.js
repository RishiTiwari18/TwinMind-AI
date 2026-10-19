const express = require("express");

const router = express.Router();

const {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal
} = require("../controllers/goalController");

router.route("/")
  .post(createGoal)
  .get(getAllGoals);

router.route("/:id")
  .get(getGoalById)
  .patch(updateGoal)
  .delete(deleteGoal);

module.exports = router;