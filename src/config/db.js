
// db.js - database connection module
// This module establishes a connection to the MongoDB database using Mongoose. It exports a function that can be called to connect to the database, ensuring that only one connection is established and reused throughout the application.
const mongoose = require("mongoose");

let connectionPromise; // a variable to store active connection attempt.


// A function that other files can call before starting the server to ensure that the database connection is established.
async function connectDB() {
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose // this initializes the connection to the MongoDB database using Mongoose.

    .connect(process.env.MONGO_URI) // connect to the Mongo BD using the URL in the .env file
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => {
      console.error("DB connection error:", err.message);
      connectionPromise = null; // reset the connectionPromise to null if the connection fails, allowing for retry attempts in the future.
      throw err;
    });

  return connectionPromise;
}

//export the function so that other modules can import and call it, this allows the server to ensure that the database connection is established before handling any API requests.
module.exports = connectDB;
