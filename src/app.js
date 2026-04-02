// src/app.js

require('dotenv').config(); // ✅ load env variables FIRST

const express = require('express');
const app = express();

const connectDB = require("./config/db");

connectDB();

app.use(express.json());

// routes
const taskRoutes = require("./routes/taskRoutes");
app.use("/tasks", taskRoutes);

const path = require("path");

// serve frontend
app.use(express.static(path.join(__dirname, "public")));
// app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});