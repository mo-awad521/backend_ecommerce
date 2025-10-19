// src/utils/cache.js
import redisClient from "../config/redis.js";
import logger from "../config/logger.js";

export const setCache = async (key, data, ttl = 60) => {
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    console.log(`🧩 Cache SET: ${key}`);
  } catch (err) {
    logger.error("Redis SET error:", err);
  }
};

export const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (value) {
      console.log(`⚡ Cache HIT: ${key}`);
    } else {
      console.log(`🕵️ Cache MISS: ${key}`);
    }
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.error("Redis GET error:", err);
    return null;
  }
};

export const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (err) {
    logger.error("Redis DEL error:", err);
  }
};
