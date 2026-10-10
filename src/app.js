const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const logger = require('./middleware/logger');

const app = express();
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => res.json({ name: 'TaskFlow API', endpoints: '/tasks' }));
app.use('/tasks', taskRoutes);

app.use((req, res) => res.status(404).json({ error: 'Endpoint bulunamadı.' }));
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Geçersiz JSON formatı.' });
  console.error(err);
  return res.status(500).json({ error: 'Sunucu hatası.' });
});

module.exports = app;
