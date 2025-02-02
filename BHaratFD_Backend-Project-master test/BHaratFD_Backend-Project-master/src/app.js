require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');
const connectDB = require('./config/database');
const Redis = require('redis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    mongodb: mongoose.connection.readyState === 1 ? 'up' : 'down',
    redis: 'checking'
  };

  try {
    const redisClient = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    await redisClient.connect();
    await redisClient.ping();
    health.redis = 'up';
    await redisClient.quit();
  } catch (err) {
    health.redis = 'down';
    console.warn('Redis health check failed:', err.message);
  }

  res.json(health);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;