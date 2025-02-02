const Redis = require('redis');

let client = null;
const RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

const initializeRedis = async (retryCount = 0) => {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || 'redis://<primary-endpoint>:6379';
    
    client = Redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > MAX_RETRIES) return false;
          return RETRY_DELAY;
        },
        connectTimeout: 10000
      }
    });

    client.on('error', (err) => {
      console.warn('Redis Client Error:', err);
    });

    try {
      await client.connect();
    } catch (err) {
      console.warn('Redis connection failed:', err.message);
      client = null; // Reset client on failure
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying Redis connection (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return initializeRedis(retryCount + 1);
      }
      return null;
    }
  }
  return client;
};

// Middleware with fallback
module.exports = async (req, res, next) => {
  try {
    const redisClient = await initializeRedis();
    
    if (!redisClient || !redisClient.isOpen) {
      return next(); // Continue without caching
    }

    const key = `faq:${req.query.lang || 'en'}`;
    try {
      const data = await redisClient.get(key);
      if (data !== null) {
        return res.json(JSON.parse(data));
      }
    } catch (err) {
      console.warn('Redis get operation failed:', err.message);
      return next();
    }

    // Override response to cache data
    res.sendResponse = res.json;
    res.json = (body) => {
      redisClient.setEx(key, 3600, JSON.stringify(body))
        .catch(err => console.warn('Redis cache set failed:', err.message));
      res.sendResponse(body);
    };
    
    next();
  } catch (error) {
    console.warn('Cache middleware error:', error.message);
    next();
  }
};