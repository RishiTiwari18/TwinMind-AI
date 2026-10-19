function validateCreateGoal(body) {
  const errors = [];

  if (typeof body.title !== "string" || body.title.trim() === "") {
    errors.push("Goal title is required");
  }

  if (
    body.description !== undefined &&
    typeof body.description !== "string"
  ) {
    errors.push("Description must be a string");
  }

  if (
    body.targetDays !== undefined &&
    (!Number.isInteger(body.targetDays) || body.targetDays < 1)
  ) {
    errors.push("targetDays must be a positive integer");
  }

  return errors;
}

module.exports = {
  validateCreateGoal
};