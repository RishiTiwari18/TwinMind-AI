let goals = [];

let nextId = 1;

function createGoal(req, res) {
  const { title, description = "", targetDays } = req.body;

  if (typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Goal title is required"
    });
  }

  if (
    targetDays !== undefined &&
    (!Number.isInteger(targetDays) || targetDays < 1)
  ) {
    return res.status(400).json({
      success: false,
      message: "targetDays must be a positive integer"
    });
  }

  const goal = {
    id: String(nextId++),
    title: title.trim(),
    description:
      typeof description === "string" ? description.trim() : "",
    targetDays: targetDays ?? null,
    completed: false,
    createdAt: new Date().toISOString()
  };

  goals.push(goal);

  return res.status(201).json({
    success: true,
    message: "Goal created successfully",
    goal
  });
}

function getAllGoals(req, res) {
  let result = [...goals];

  if (req.query.completed !== undefined) {
    if (
      req.query.completed !== "true" &&
      req.query.completed !== "false"
    ) {
      return res.status(400).json({
        success: false,
        message: "completed must be true or false"
      });
    }

    const completed = req.query.completed === "true";

    result = result.filter((goal) => goal.completed === completed);
  }

  return res.status(200).json({
    success: true,
    count: result.length,
    goals: result
  });
}

function getGoalById(req, res) {
  const goal = goals.find((item) => item.id === req.params.id);

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found"
    });
  }

  return res.status(200).json({
    success: true,
    goal
  });
}

function updateGoal(req, res) {
  const goal = goals.find((item) => item.id === req.params.id);

  if (!goal) {
    return res.status(404).json({
      success: false,
      message: "Goal not found"
    });
  }

  const allowedFields = ["title", "description", "targetDays", "completed"];
  const updates = req.body;
  const updateKeys = Object.keys(updates);

  if (
    updateKeys.length === 0 ||
    updateKeys.some((key) => !allowedFields.includes(key))
  ) {
    return res.status(400).json({
      success: false,
      message: "Provide valid goal fields to update"
    });
  }

  if (
    "title" in updates &&
    (typeof updates.title !== "string" || updates.title.trim() === "")
  ) {
    return res.status(400).json({
      success: false,
      message: "Title must be a non-empty string"
    });
  }

  if (
    "description" in updates &&
    typeof updates.description !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Description must be a string"
    });
  }

  if (
    "targetDays" in updates &&
    (!Number.isInteger(updates.targetDays) || updates.targetDays < 1)
  ) {
    return res.status(400).json({
      success: false,
      message: "targetDays must be a positive integer"
    });
  }

  if (
    "completed" in updates &&
    typeof updates.completed !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "completed must be a Boolean"
    });
  }

  if ("title" in updates) {
    goal.title = updates.title.trim();
  }

  if ("description" in updates) {
    goal.description = updates.description.trim();
  }

  if ("targetDays" in updates) {
    goal.targetDays = updates.targetDays;
  }

  if ("completed" in updates) {
    goal.completed = updates.completed;
  }

  return res.status(200).json({
    success: true,
    message: "Goal updated successfully",
    goal
  });
}

function deleteGoal(req, res) {
  const index = goals.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Goal not found"
    });
  }

  const deletedGoal = goals.splice(index, 1)[0];

  return res.status(200).json({
    success: true,
    message: "Goal deleted successfully",
    goal: deletedGoal
  });
}

module.exports = {
  createGoal,
  getAllGoals,
  getGoalById,
  updateGoal,
  deleteGoal
};