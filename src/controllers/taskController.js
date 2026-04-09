
//Purpose - Receives the requests from the routes and calls the appropriate service functions to perform the business logic for each endpoint related to task management

// variable to create an instance of a tsk service, this allow us to call the service functions from the controller.
const { createTaskService } = require("../services/taskService");


const taskService = createTaskService();

// Controller functions - these are called by the routes when a request is made to the corresponding endpoint.

// getTask - handles GET requests 
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAll();
    res.json(tasks); //
  } catch (error) {
    next(error);
  }
};

//addTasks - handles POST request to create a new task.
exports.addTask = async (req, res, next) => {
  try {
    const newTask = await taskService.create(req.body);
    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

//updateTask - handles PUT requests to update an existing task by ID
exports.updateTask = async (req, res, next) => {
  try {
    const updatedTask = await taskService.update(req.params.id, req.body);
    res.json(updatedTask);//
  } catch (error) {
    next(error);
  }
};

//deleteTask - handles DELETE requestes to delete tasks by ID.
exports.deleteTask = async (req, res, next) => {
  try {
    await taskService.remove(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
