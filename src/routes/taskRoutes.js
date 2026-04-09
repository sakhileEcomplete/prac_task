 // Maps URLs to controller functions that handle the logic for each API endpoint related to task management.
 
 
 // Express framework for building the API routes
const express = require("express");

 // Import the task controller which contains the logic for handling task-related operations (get, add, update, delete tasks)
const taskController = require("../controllers/taskController");

const router = express.Router(); //create a new router object to define the routes for task management.


// Define the routes for task management, mapping HTTP methods and endpoints to the corresponding controller functions that handle the business logic for each operation (get, add, update, delete tasks).
router.get("/", taskController.getTasks);// GET /api/tasks - Retrieve all tasks, used GET because we are fetching data from the server without modifying any resource.
router.post("/", taskController.addTask); // POST /api/tasks - Create a new task, used POST because we are sending data to the server to create a new resource (task).
router.put("/:id", taskController.updateTask);// PUT /api/tasks/:id - Update an existing task by ID - used PUT because we are sending data to the server to update an existing resource (task) identified by its ID.
router.delete("/:id", taskController.deleteTask); // DELETE /api/tasks/:id - Delete a task by ID - used DELETE because we are requesting the server to delete a resource (task) identified by its ID.

module.exports = router; // export router so that it can be accessed by the main server file (server.js). This allows the server to use these routes when handling incoming API requests related to task management.
