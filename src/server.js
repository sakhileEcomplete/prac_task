
//builds the Express Server. It prepares the app and exports it for app.js

// Express framework for building the API routes
const express = require("express");
const path = require("path");

// imports Routes for task management, which maps URLs to controller functions that handle the logic for each API endpoint related to task management.
const taskRoutes = require("./routes/taskRoutes");

// Create Express app
const app = express();

// Middleware - parse JSON and serve static files so that we can serve our frontend from the same server if needed 
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API routes - 
app.use("/api/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

// Health check route - useful for monitoring and load balancers to check if the server is alive
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// 404 handler - catch all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler - catches any errors thrown in the route handlers and sends a JSON response with the error message and status code
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

module.exports = app; // export the app for app.js to import and start the server.

