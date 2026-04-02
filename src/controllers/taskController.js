// src/controllers/taskController.js

const taskService = require("../services/taskService"); // Import the task service to handle business logic related to tasks


// Get all tasks
exports.getTasks = async (req, res) => {
  const tasks = await taskService.getAll(); // Retrieve all tasks from the service
  res.json(tasks); // Send the list of tasks as a JSON response
};

// Add a new task
exports.addTask = async (req, res) => {
  const newTask = await taskService.add(req.body.task); // Add a new task using the service and get the created task
  res.json(newTask); // Send the newly created task as a JSON response
};

