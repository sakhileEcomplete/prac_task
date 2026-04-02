// src/app.js

const express = require('express');// Import the Express library
const app = express();// Create an instance of the Express application

// Middleware to parse JSON bodies in incoming requests
app.use(express.json());

//routes
const taskRoutes = require("./routes/taskRoutes");// Import the task routes to handle requests related to tasks
app.use("/tasks", taskRoutes);// Use the task routes for any requests to the /tasks endpoint

const path = require("path");

// serve frontend
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;// Define the port to listen on

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);// Start the server and log a message to the console
});