
// Task Model - defines the structure of the task documents in the MongoDB database using Mongoose Schemas. 
// This model is used by the service layer to perform CRUD operations on the tasks collection in the database.

const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    frequency: {
      type: String,
      enum: ["none", "daily", "weekly", "monthly", "custom"],
      default: "none",
    },
    daysOfWeek: {
      type: [String],
      default: [],
    },
    time: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: "",
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "pending",
    },
    deadlineAt: {
      type: Date,
      default: null,
    },
    reminderAt: {
      type: Date,
      default: null,
    },
    schedule: {
      type: scheduleSchema,
      default: () => ({
        frequency: "none",
        daysOfWeek: [],
        time: "",
        label: "",
      }),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
