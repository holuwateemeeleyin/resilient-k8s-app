const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Resilient Kubernetes application is running!',
    instance: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

app.get('/health/ready', (req, res) => {
  res.status(200).json({ status: 'ready' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API listening on port ${PORT}`);
});
