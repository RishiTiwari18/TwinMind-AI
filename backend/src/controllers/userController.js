async function getCurrentUser(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "Authentication successful",
      data: {
        userId: req.user.id,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCurrentUser,
};