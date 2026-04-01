

const express = require("express"); // Import the Express library to create a router for handling task-related routes
const router = express.Router(); // Create a new router instance to define routes for tasks

// Import the task controller to handle incoming requests related to tasks and delegate them to the appropriate service functions
const taskController = require("../controllers/taskController"); 

// Define routes for tasks:
router.get("/", taskController.getTasks);
router.post("/", taskController.addTask);


module.exports = router;// 