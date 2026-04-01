// src/controllers/taskController.js

const taskService = require("../services/taskService"); // Import the task service to handle business logic related to tasks

// 
exports.getTasks = (req, res) => {
  res.json(taskService.getAll());
};

// Add a new task
exports.addTask = (req, res) => {
  const task = taskService.add(req.body.task);
  res.json(task);
};