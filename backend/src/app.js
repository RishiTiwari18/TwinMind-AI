require("dotenv").config();

const express = require("express");

const healthRoutes = require("./routes/healthRoutes");
const goalRoutes = require("./routes/goalRoutes");
const requestLogger = require("./middleware/requestLogger");
const errorHandler = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");


const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to TwinMind AI Backend",
    status: "Running"
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use(errorHandler);

module.exports = app;