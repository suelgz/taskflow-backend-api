const test = require('node:test');
const assert = require('node:assert/strict');
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-test-'));
process.env.TASKS_DATA_FILE = path.join(tmpDir, 'tasks.json');

const controller = require('../src/controllers/taskController');
const logger = require('../src/middleware/logger');

function response() {
  return {
    code: 200, payload: null,
    status(code) { this.code = code; return this; },
    json(body) { this.payload = body; return this; }
  };
}
let taskId;
test('POST /tasks: create task (201)', () => {
  const res = response();
  controller.createTask({ body: { title: 'Backend API', assignee: 'Su', priority: 'high' } }, res);
  assert.equal(res.code, 201); assert.equal(res.payload.status, 'pending');
  assert.ok(res.payload.id); taskId = res.payload.id;
});
test('GET /tasks: list tasks (200)', () => {
  const res = response(); controller.getAllTasks({}, res);
  assert.equal(res.code, 200); assert.equal(res.payload.length, 1); assert.equal(res.payload[0].id, taskId);
});
test('GET /tasks/:id: get details (200)', () => {
  const res = response(); controller.getTaskById({ params: { id: taskId } }, res);
  assert.equal(res.code, 200); assert.equal(res.payload.title, 'Backend API');
});
test('PUT /tasks/:id: update status (200)', () => {
  const res = response(); controller.updateTask({ params: { id: taskId }, body: { status: 'completed' } }, res);
  assert.equal(res.code, 200); assert.equal(res.payload.status, 'completed');
});
test('DELETE /tasks/:id: remove task (200)', () => {
  const res = response(); controller.deleteTask({ params: { id: taskId } }, res);
  assert.equal(res.code, 200); assert.equal(res.payload.deletedTaskId, taskId);
  assert.deepEqual(JSON.parse(fs.readFileSync(process.env.TASKS_DATA_FILE, 'utf8')), []);
});
test('Invalid request and missing tasks return errors', () => {
  let res = response(); controller.getTaskById({ params: { id: 'missing' } }, res);
  assert.equal(res.code, 404);
  res = response(); controller.createTask({ body: { title: '' } }, res);
  assert.equal(res.code, 400);
});
test('Logger writes timestamp, HTTP method and path', () => {
  let output = ''; const oldLog = console.log;
  console.log = (msg) => { output = msg; };
  try {
    let called = false;
    logger({ method: 'GET', originalUrl: '/tasks' }, {}, () => { called = true; });
    assert.equal(called, true);
    assert.match(output, /\[\d{4}-\d{2}-\d{2}T.*\] GET \/tasks/);
  } finally { console.log = oldLog; }
});
