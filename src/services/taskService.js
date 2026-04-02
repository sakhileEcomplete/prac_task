// let tasks = []; // In-memory task storage

// Import the Task model to interact with the database for task-related operations
const Tasks  = require("../models/taskModel"); 

exports.getAll = () => async () => {
    // Retrieve all tasks from the database using the Task model
    return await Tasks.find();
};


exports.add = async (task) => {
    return await Tasks.create({ task }); // Create a new task in the database and return the created task           

};




//
// exports.add = (task) => {
//     //Create a new task object with a unique ID and the provided task description
//     const newTask = { id: Date.now(), task };

//     // Add the new task to the in-memory storage
//     tasks.push(newTask);
//     return newTask;
// };

