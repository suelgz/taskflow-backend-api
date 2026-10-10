const { randomUUID } = require('node:crypto');
const store = require('../data/taskStore');

const VALID_STATUSES = ['pending', 'in-progress', 'completed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

function getAllTasks(req, res) {
  return res.json(store.readTasks());
}

function getTaskById(req, res) {
  const task = store.readTasks().find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Görev bulunamadı.' });
  return res.json(task);
}

function validateFields(fields, { isNew = false } = {}) {
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) return 'Geçerli bir JSON nesnesi gönderin.';
  if ((isNew || fields.title !== undefined) && (typeof fields.title !== 'string' || !fields.title.trim())) {
    return 'Görev başlığı (title) zorunludur.';
  }
  for (const field of ['description', 'assignee', 'project']) {
    if (fields[field] !== undefined && typeof fields[field] !== 'string') return `${field} metin olmalıdır.`;
  }
  if (fields.status !== undefined && !VALID_STATUSES.includes(fields.status)) {
    return `status: ${VALID_STATUSES.join(', ')} olmalıdır.`;
  }
  if (fields.priority !== undefined && !VALID_PRIORITIES.includes(fields.priority)) {
    return `priority: ${VALID_PRIORITIES.join(', ')} olmalıdır.`;
  }
  return null;
}

function createTask(req, res) {
  const error = validateFields(req.body, { isNew: true });
  if (error) return res.status(400).json({ error });

  const now = new Date().toISOString();
  const task = {
    id: randomUUID(),
    title: req.body.title.trim(),
    description: req.body.description ?? '',
    assignee: req.body.assignee ?? 'Unassigned',
    project: req.body.project ?? 'General',
    priority: req.body.priority ?? 'medium',
    status: req.body.status ?? 'pending',
    createdAt: now,
    updatedAt: now
  };
  const tasks = store.readTasks();
  tasks.push(task);
  store.saveTasks(tasks);
  return res.status(201).json(task);
}

function updateTask(req, res) {
  const error = validateFields(req.body);
  if (error) return res.status(400).json({ error });

  const tasks = store.readTasks();
  const index = tasks.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Görev bulunamadı.' });

  for (const field of ['title', 'description', 'assignee', 'project', 'priority', 'status']) {
    if (req.body[field] !== undefined) {
      tasks[index][field] = field === 'title' ? req.body[field].trim() : req.body[field];
    }
  }
  tasks[index].updatedAt = new Date().toISOString();
  store.saveTasks(tasks);
  return res.json(tasks[index]);
}

function deleteTask(req, res) {
  const tasks = store.readTasks();
  const index = tasks.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Görev bulunamadı.' });

  const [removed] = tasks.splice(index, 1);
  store.saveTasks(tasks);
  return res.json({ message: 'Görev silindi.', deletedTaskId: removed.id });
}

module.exports = { getAllTasks, getTaskById, createTask, updateTask, deleteTask };
