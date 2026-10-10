const fs = require('node:fs');
const path = require('node:path');

const filePath = process.env.TASKS_DATA_FILE || path.join(__dirname, '../../data/tasks.json');

function readTasks() {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8').trim();
  return content ? JSON.parse(content) : [];
}

function saveTasks(tasks) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2) + '\n', 'utf8');
}

module.exports = { readTasks, saveTasks };
