// src/middleware/cacheMiddleware.js
import redisClient from "../config/redis.js";

/**
 * Middleware for automatic cash management
 * @param {string} prefix - The name of the category or entity (such as "products" or "categories")
 * @param {number} ttl - Cache lifespan in seconds (default: 60 seconds)
 */
export const cacheMiddleware = (prefix, ttl = 60) => {
  return async (req, res, next) => {
    try {
      const key = `${prefix}:${JSON.stringify(req.query)}`;
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        console.log(`⚡ Cache HIT [${key}]`);
        return res.status(200).json({
          source: "cache",
          data: JSON.parse(cachedData),
        });
      }

      console.log(`🕵️ Cache MISS [${key}]`);

      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          await redisClient.set(key, JSON.stringify(body.data || body), "EX", ttl); // ✅ الترتيب الصحيح
          console.log(`🧩 Cache SET [${key}]`);
        } catch (err) {
          console.error("Redis SET error:", err);
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
};
