// App Bootstrapper - responsible for connecting to the database and starting the server
require("dotenv").config();

// connect to the database and start the server
const connectDB = require("./config/db"); 
const app = require("./server"); 

// port that the server will listen on
const PORT = process.env.PORT || 3000;


// Start the server after connecting to the database
async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Try and Catch to provide a more readable/undestandable error message if the app fails to connect to a Database instead of dumping a full crash stack.
start().catch((error) => {
  console.error("Application failed to start.");
  console.error("Check that MongoDB is running and that MONGO_URI in .env is correct.");
  console.error(`Startup error: ${error.message}`);
  process.exit(1); 
});
  