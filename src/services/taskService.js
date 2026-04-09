const mongoose = require("mongoose"); //

// Service layer - responsible for business logic and data manipulation, acts as an intermediary between controllers and models

const Task = require("../models/taskModel"); // import the Task model to interact with the tasks collection in the database.

// define the valid values for priority levvels and task statuses as sets for easy validation

// // for validating priority values
const PRIORITIES = new Set([
    "low", 
    "medium", 
    "high"]);
    
 // for validating status values
const STATUSES = new Set([
    "pending", 
    "in_progress", 
    "completed"]);

// for validating schedule frequency values
const FREQUENCIES = new Set([
    "none",
    "daily",
    "weekly", 
    "monthly", 
    "custom"]); 

// for validating the Weekday values in the schedule
const DAYS = new Set([
  "monday",
  "tuesday",
  "wednesday", //
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);


// utility function to create HTTP errors with a status code and error message. This is used throughout the service to throw consistent errors that can be caught by the global error handler in the server.
function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// function to normalize and validate text fields, data fields, and schedule fields in the task payload.
function normalizeDate(value, fieldName) {

    // here we treat undefined as "No-change" for dates.
  if (value === undefined) {
    return undefined;
  }

  //if the value is null, we treat it as no date, so we return null to clear an existing date if the user wants to remove it.
  if (value === null || value === "") {
    return null;
  }

  const date = new Date(value);

  // if the date is INVALID, getTime() will return NaN, so we check for that to validate the date input
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`); // throw an error with SC of 400, for invalid user input.
  }

  return date;
}

// function to normalize and validate the schedule object in the task payload, ensuring that the frequency, days of week, time, and label are all valid and properly formatted.
function normalizeSchedule(schedule = {}) {
  if (schedule === null) {
    return {
      frequency: "none",
      daysOfWeek: [],
      time: "",
      label: "",
    };
  }

  //
  const frequency = String(schedule.frequency || "none").toLowerCase(); // default to "none" if frequency is not provided, and convert to lowercase for consistent validation
  const time = typeof schedule.time === "string" ? schedule.time.trim() : ""; // default to empty string if time is not provided, and trim whitespace
  const label = typeof schedule.label === "string" ? schedule.label.trim() : ""; // default to empty string if label is not provided, and trim whitespace

  // validate the frequency value against the allowed set of frequencies
  if (!FREQUENCIES.has(frequency)) {
    throw createHttpError(400, "Schedule frequency is invalid"); // throw an error with SC of 400, for invalid user input.
  }

  // validate the days of week if frequency is weekly, ensuring that they are valid weekdays and properly formatted as lowercase strings.
  // This is an ARRAY, but we want to ensure that it's an array of valid weekday strings, so we normalize it to an array and validate it with the DAYS(variable set above earlier) set.

  const daysOfWeek = Array.isArray(schedule.daysOfWeek)
    ? schedule.daysOfWeek.map((day) => String(day).toLowerCase())
    : []; // default to empty array if daysOfWeek is not provided or not an array

    // if the frequency is weekly but no vali days provided we can consider it as no schedule, so we set frequency to "none" and daysOfWeek to empty array.
  if (daysOfWeek.some((day) => !DAYS.has(day))) {
    throw createHttpError(400, "Schedule days must be valid weekdays");
  }

  return {
    frequency,
    daysOfWeek,
    time,
    label,
  };
}


// function to normalize and validate the task payload for creating or updating a task, 
// ensuring that all required fields  are present and properly formatted, and that any optional fields are validated if provided. 
// This function is used by the create and update service functions to ensure that the data being saved to the database is consistent and valid.

function normalizeTaskPayload(payload, options = {}) { // payload is the raw incoming data from the client
  const { partial = false } = options;
  const normalized = {};

  
  if (!partial || payload.task !== undefined) {
    const task = typeof payload.task === "string" ? payload.task.trim() : "";
    if (!task) {
      throw createHttpError(400, "Task title is required");
    }
    normalized.task = task;
  }

  if (payload.details !== undefined) {
    normalized.details = String(payload.details || "").trim();
  } else if (!partial) {
    normalized.details = "";
  }

  if (payload.priority !== undefined) {
    const priority = String(payload.priority).toLowerCase();
    if (!PRIORITIES.has(priority)) {
      throw createHttpError(400, "Priority is invalid");
    }
    normalized.priority = priority;
  } else if (!partial) {
    normalized.priority = "medium";
  }

  if (payload.status !== undefined) {
    const status = String(payload.status).toLowerCase();
    if (!STATUSES.has(status)) {
      throw createHttpError(400, "Status is invalid");
    }
    normalized.status = status;
  } else if (!partial) {
    normalized.status = "pending";
  }

  const deadlineAt = normalizeDate(payload.deadlineAt, "deadlineAt");
  if (deadlineAt !== undefined) {
    normalized.deadlineAt = deadlineAt;
  } else if (!partial) {
    normalized.deadlineAt = null;
  }

  const reminderAt = normalizeDate(payload.reminderAt, "reminderAt");
  if (reminderAt !== undefined) {
    normalized.reminderAt = reminderAt;
  } else if (!partial) {
    normalized.reminderAt = null;
  }

  if (
    payload.schedule !== undefined ||
    (!partial && payload.schedule === undefined)
  ) {
    normalized.schedule = normalizeSchedule(payload.schedule);
  }

  // if both deadline and reminder are provided, we validate that the reminder is before the deadline, this is a business rule to ensure that reminders make sense in relation to deadlines.
  const resolvedDeadline = normalized.deadlineAt ?? payload.deadlineAt;
  const resolvedReminder = normalized.reminderAt ?? payload.reminderAt;
  if (resolvedDeadline instanceof Date && resolvedReminder instanceof Date) {
    if (resolvedReminder.getTime() > resolvedDeadline.getTime()) {
      throw createHttpError(400, "Reminder must be before the deadline");
    }
  }

  return normalized;
}

  // function to create a task service instance, which provides methods for GETTING all tasks, CREATING a new task, UPDATING an existing task by ID, and DELETING a task by ID. 
  // Each method interacts with the task model to perform the necessary database operations, and uses the normalization and validation functions to ensure that the data being processed is valid and consistent. 
  // This service layer abstracts away the business logic from the controllers, allowing for cleaner and more maintainable code.

    function createTaskService(taskModel = Task) {
  return {

// getAll method
    async getAll() {
      return taskModel.find().sort({ deadlineAt: 1, createdAt: -1 });
    },
// create method
    async create(payload) {
      const taskData = normalizeTaskPayload(payload);
      return taskModel.create(taskData);
    },

// update method 
    async update(id, payload) {
      if (taskModel === Task && !mongoose.isValidObjectId(id)) {
        throw createHttpError(400, "Task id is invalid");
      }

      const updates = normalizeTaskPayload(payload, { partial: true });
      const updatedTask = await taskModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedTask) {
        throw createHttpError(404, "Task not found");
      }

      return updatedTask;
    },

// remove method
    async remove(id) {
      if (taskModel === Task && !mongoose.isValidObjectId(id)) {
        throw createHttpError(400, "Task id is invalid");
      }

      const deletedTask = await taskModel.findByIdAndDelete(id);

      if (!deletedTask) {
        throw createHttpError(404, "Task not found");
      }

      return deletedTask;
    },
  };
}

// export the modules (functions) so that they can be imported and used by the controllers and other parts of the application.
module.exports = {
  createHttpError,
  createTaskService,
  normalizeTaskPayload,
};
