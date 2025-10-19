// import { createClient } from "redis";
// import dotenv from "dotenv";
// import logger from "./logger.js";

// dotenv.config();

// const redisClient = createClient({
//   url: process.env.REDIS_URL || "redis://localhost:6379",
// });

// redisClient.on("connect", () => logger.info("✅ Redis connected successfully"));
// redisClient.on("error", (err) => logger.error("❌ Redis error:", err));

// await redisClient.connect();

// export default redisClient;

// src/config/redis.js
import IORedis from "ioredis";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const redisClient = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redisClient.on("connect", () => logger.info("✅ Redis connected successfully"));
redisClient.on("error", (err) => logger.error("❌ Redis error:", err));

export default redisClient;
