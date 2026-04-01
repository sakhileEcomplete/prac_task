let tasks = []; // In-memory task storage

exports.getAll = () => tasks; // Get all tasks

// 
exports.add = (task) => {
    //Create a new task object with a unique ID and the provided task description
    const newTask = { id: Date.now(), task };

    //
    tasks.push(newTask);
    return newTask;
};

