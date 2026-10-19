function getHealth(req, res) {
  res.json({
    success: true,
    message: "TwinMind AI server is healthy"
  });
}

module.exports = {
  getHealth
};