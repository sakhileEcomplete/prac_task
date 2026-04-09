const API_URL = "/api/tasks";

const state = {
  tasks: [],
  filter: "all",
  editingId: null,
};

const elements = {
  form: document.getElementById("taskForm"),
  taskId: document.getElementById("taskId"),
  taskInput: document.getElementById("taskInput"),
  taskDetails: document.getElementById("taskDetails"),
  taskPriority: document.getElementById("taskPriority"),
  taskStatus: document.getElementById("taskStatus"),
  taskDeadline: document.getElementById("taskDeadline"),
  taskReminder: document.getElementById("taskReminder"),
  scheduleFrequency: document.getElementById("scheduleFrequency"),
  scheduleTime: document.getElementById("scheduleTime"),
  scheduleLabel: document.getElementById("scheduleLabel"),
  statusFilter: document.getElementById("statusFilter"),
  taskList: document.getElementById("taskList"),
  reminderList: document.getElementById("reminderList"),
  flashMessage: document.getElementById("flashMessage"),
  submitButton: document.getElementById("submitButton"),
  resetButton: document.getElementById("resetButton"),
  pendingCount: document.getElementById("pendingCount"),
  progressCount: document.getElementById("progressCount"),
  completedCount: document.getElementById("completedCount"),
  reminderCount: document.getElementById("reminderCount"),
  taskCount: document.getElementById("taskCount"),
};

function getSelectedDays() {
  return Array.from(document.querySelectorAll(".day-picker input:checked")).map(
    (input) => input.value
  );
}

function setSelectedDays(days = []) {
  const selectedDays = new Set(days);
  document.querySelectorAll(".day-picker input").forEach((input) => {
    input.checked = selectedDays.has(input.value);
  });
}

function toDateTimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function scheduleSummary(schedule) {
  if (!schedule || schedule.frequency === "none") {
    return "No recurring schedule";
  }

  const bits = [schedule.frequency];
  if (schedule.daysOfWeek?.length) {
    bits.push(schedule.daysOfWeek.join(", "));
  }
  if (schedule.time) {
    bits.push(schedule.time);
  }
  if (schedule.label) {
    bits.push(schedule.label);
  }

  return bits.join(" - ");
}

function showMessage(message, type = "info") {
  elements.flashMessage.hidden = false;
  elements.flashMessage.textContent = message;
  elements.flashMessage.className = `flash-message ${type}`;

  window.clearTimeout(showMessage.timeoutId);
  showMessage.timeoutId = window.setTimeout(() => {
    elements.flashMessage.hidden = true;
  }, 3000);
}

async function request(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = "Something went wrong";
    try {
      const data = await response.json();
      errorMessage = data.message || errorMessage;
    } catch (error) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function loadTasks() {
  try {
    state.tasks = await request(API_URL);
    render();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function getPayloadFromForm() {
  return {
    task: elements.taskInput.value.trim(),
    details: elements.taskDetails.value.trim(),
    priority: elements.taskPriority.value,
    status: elements.taskStatus.value,
    deadlineAt: elements.taskDeadline.value || null,
    reminderAt: elements.taskReminder.value || null,
    schedule: {
      frequency: elements.scheduleFrequency.value,
      time: elements.scheduleTime.value,
      label: elements.scheduleLabel.value.trim(),
      daysOfWeek: getSelectedDays(),
    },
  };
}

function resetForm() {
  elements.form.reset();
  elements.taskId.value = "";
  state.editingId = null;
  elements.submitButton.textContent = "Save Task";
  setSelectedDays([]);
}

function fillForm(task) {
  elements.taskId.value = task._id;
  state.editingId = task._id;
  elements.taskInput.value = task.task || "";
  elements.taskDetails.value = task.details || "";
  elements.taskPriority.value = task.priority || "medium";
  elements.taskStatus.value = task.status || "pending";
  elements.taskDeadline.value = toDateTimeLocalValue(task.deadlineAt);
  elements.taskReminder.value = toDateTimeLocalValue(task.reminderAt);
  elements.scheduleFrequency.value = task.schedule?.frequency || "none";
  elements.scheduleTime.value = task.schedule?.time || "";
  elements.scheduleLabel.value = task.schedule?.label || "";
  setSelectedDays(task.schedule?.daysOfWeek || []);
  elements.submitButton.textContent = "Update Task";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = getPayloadFromForm();

  try {
    if (state.editingId) {
      await request(`${API_URL}/${state.editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      showMessage("Task updated", "success");
    } else {
      await request(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      showMessage("Task created", "success");
    }

    resetForm();
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function updateTask(id, payload, successMessage) {
  try {
    await request(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    showMessage(successMessage, "success");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

async function deleteTask(id) {
  try {
    await request(`${API_URL}/${id}`, { method: "DELETE" });
    if (state.editingId === id) {
      resetForm();
    }
    showMessage("Task deleted", "success");
    await loadTasks();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function renderCounts(tasks) {
  const pending = tasks.filter((task) => task.status === "pending").length;
  const inProgress = tasks.filter((task) => task.status === "in_progress").length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const reminders = tasks.filter((task) => task.reminderAt).length;

  elements.pendingCount.textContent = pending;
  elements.progressCount.textContent = inProgress;
  elements.completedCount.textContent = completed;
  elements.reminderCount.textContent = reminders;
  elements.taskCount.textContent = tasks.length;
}

function renderReminderList(tasks) {
  const reminderTasks = tasks
    .filter((task) => task.reminderAt)
    .sort((a, b) => new Date(a.reminderAt) - new Date(b.reminderAt))
    .slice(0, 4);

  if (!reminderTasks.length) {
    elements.reminderList.className = "mini-list empty-state";
    elements.reminderList.textContent = "No reminders scheduled yet.";
    return;
  }

  elements.reminderList.className = "mini-list";
  elements.reminderList.innerHTML = reminderTasks
    .map(
      (task) => `
        <article class="mini-card">
          <strong>${task.task}</strong>
          <span>${formatDate(task.reminderAt)}</span>
        </article>
      `
    )
    .join("");
}

function taskCard(task) {
  const isOverdue =
    task.deadlineAt &&
    task.status !== "completed" &&
    new Date(task.deadlineAt).getTime() < Date.now();

  return `
    <article class="task-card ${task.status}">
      <div class="task-card-top">
        <div>
          <p class="task-priority ${task.priority}">${task.priority}</p>
          <h3>${task.task}</h3>
        </div>
        <span class="status-pill">${task.status.replace("_", " ")}</span>
      </div>

      <p class="task-details">${task.details || "No extra notes added yet."}</p>

      <dl class="task-meta">
        <div>
          <dt>Deadline</dt>
          <dd class="${isOverdue ? "overdue" : ""}">${formatDate(task.deadlineAt)}</dd>
        </div>
        <div>
          <dt>Reminder</dt>
          <dd>${formatDate(task.reminderAt)}</dd>
        </div>
        <div>
          <dt>Schedule</dt>
          <dd>${scheduleSummary(task.schedule)}</dd>
        </div>
      </dl>

      <div class="task-actions">
        <button type="button" data-action="edit" data-id="${task._id}">Edit</button>
        <button type="button" data-action="toggle" data-id="${task._id}">
          ${task.status === "completed" ? "Mark Pending" : "Mark Complete"}
        </button>
        <button type="button" data-action="delete" data-id="${task._id}" class="danger-btn">Delete</button>
      </div>
    </article>
  `;
}

function renderTaskList(tasks) {
  const filteredTasks =
    state.filter === "all"
      ? tasks
      : tasks.filter((task) => task.status === state.filter);

  if (!filteredTasks.length) {
    elements.taskList.className = "task-list empty-state";
    elements.taskList.textContent = "No tasks match the current filter.";
    return;
  }

  elements.taskList.className = "task-list";
  elements.taskList.innerHTML = filteredTasks.map(taskCard).join("");
}

function render() {
  renderCounts(state.tasks);
  renderReminderList(state.tasks);
  renderTaskList(state.tasks);
}

elements.form.addEventListener("submit", handleSubmit);
elements.resetButton.addEventListener("click", resetForm);
elements.statusFilter.addEventListener("change", (event) => {
  state.filter = event.target.value;
  renderTaskList(state.tasks);
});

elements.taskList.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const task = state.tasks.find((item) => item._id === id);
  if (!task) {
    return;
  }

  const action = button.dataset.action;

  if (action === "edit") {
    fillForm(task);
    return;
  }

  if (action === "toggle") {
    const nextStatus = task.status === "completed" ? "pending" : "completed";
    await updateTask(
      id,
      {
        task: task.task,
        details: task.details,
        priority: task.priority,
        status: nextStatus,
        deadlineAt: task.deadlineAt,
        reminderAt: task.reminderAt,
        schedule: task.schedule,
      },
      `Task marked ${nextStatus === "completed" ? "complete" : "pending"}`
    );
    return;
  }

  if (action === "delete") {
    await deleteTask(id);
  }
});

loadTasks();
