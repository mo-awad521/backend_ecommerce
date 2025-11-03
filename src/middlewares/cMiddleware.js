import redisClient from "../config/redis.js";

export const cacheMiddleware = (prefix) => async (req, res, next) => {
  try {
    const key = `${prefix}:${req.originalUrl}`;

    const cached = await redisClient.get(key);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const originalSend = res.json.bind(res);
    res.json = (data) => {
      redisClient.setEx(key, 60 * 5, JSON.stringify(data));
      return originalSend(data);
    };

    next();
  } catch (err) {
    console.error("❌ Cache middleware error:", err);
    next();
  }
};
