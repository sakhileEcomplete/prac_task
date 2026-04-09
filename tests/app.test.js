const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("node:http");

const app = require("../src/server");
const {
  createTaskService,
  normalizeTaskPayload,
} = require("../src/services/taskService");

test("normalizeTaskPayload builds a complete planner task", () => {
  const payload = normalizeTaskPayload({
    task: "Plan launch",
    details: "Finalize the launch checklist",
    priority: "high",
    status: "in_progress",
    deadlineAt: "2026-04-10T14:00",
    reminderAt: "2026-04-10T09:00",
    schedule: {
      frequency: "weekly",
      daysOfWeek: ["monday", "friday"],
      time: "09:30",
      label: "Standup prep",
    },
  });

  assert.equal(payload.task, "Plan launch");
  assert.equal(payload.priority, "high");
  assert.equal(payload.status, "in_progress");
  assert.equal(payload.schedule.frequency, "weekly");
  assert.deepEqual(payload.schedule.daysOfWeek, ["monday", "friday"]);
  assert.ok(payload.deadlineAt instanceof Date);
  assert.ok(payload.reminderAt instanceof Date);
});

test("normalizeTaskPayload rejects reminders after the deadline", () => {
  assert.throws(
    () =>
      normalizeTaskPayload({
        task: "Late reminder",
        deadlineAt: "2026-04-10T09:00",
        reminderAt: "2026-04-10T10:00",
      }),
    /Reminder must be before the deadline/
  );
});

test("task service create and update work with a model-like adapter", async () => {
  const records = [];
  const fakeModel = {
    async find() {
      return {
        sort() {
          return [...records];
        },
      };
    },
    async create(data) {
      const record = { _id: String(records.length + 1), ...data };
      records.push(record);
      return record;
    },
    async findByIdAndUpdate(id, updates) {
      const record = records.find((item) => item._id === id);
      if (!record) {
        return null;
      }

      Object.assign(record, updates);
      return record;
    },
    async findByIdAndDelete(id) {
      const index = records.findIndex((item) => item._id === id);
      if (index === -1) {
        return null;
      }

      const [deleted] = records.splice(index, 1);
      return deleted;
    },
  };

  const service = createTaskService(fakeModel);

  const created = await service.create({
    task: "Draft roadmap",
    priority: "medium",
    status: "pending",
  });

  assert.equal(created.task, "Draft roadmap");

  const updated = await service.update(created._id, {
    status: "completed",
    details: "Shared with the team",
  });

  assert.equal(updated.status, "completed");
  assert.equal(updated.details, "Shared with the team");

  await service.remove(created._id);
  assert.equal(records.length, 0);
});

test("health route responds successfully", async () => {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
