require("dotenv").config();

const express = require("express");

const healthRoutes = require("./routes/healthRoutes");
const goalRoutes = require("./routes/goalRoutes");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TwinMind AI Backend",
    status: "Running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/goals", goalRoutes);

module.exports = app;