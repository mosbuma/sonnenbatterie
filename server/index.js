const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

let currentTime = new Date('2025-01-01T00:00:00');
let timeRunning = false;
let intervalId = null;

// Set initial time
app.post('/api/v2/time/set', (req, res) => {
  const { time } = req.body;
  currentTime = new Date(time);
  res.json({ success: true });
});

// Start time simulation
app.post('/api/v2/time/start', (req, res) => {
  if (!timeRunning) {
    timeRunning = true;
    intervalId = setInterval(() => {
      currentTime.setSeconds(currentTime.getSeconds() + 1);
    }, 1000);
  }
  res.json({ running: timeRunning });
});

// Stop time simulation
app.post('/api/v2/time/stop', (req, res) => {
  if (timeRunning) {
    clearInterval(intervalId);
    timeRunning = false;
  }
  res.json({ running: timeRunning });
});

// Spend time (single tick)
app.post('/api/v2/time', (req, res) => {
  const { duration } = req.body;
  currentTime.setSeconds(currentTime.getSeconds() + duration);
  res.json({ running: timeRunning });
});

// Get current time
app.get('/api/v2/time/current', (req, res) => {
  res.json({ currentTime: currentTime.toISOString() });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});