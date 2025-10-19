import redisClient from "../config/redis.js";

const prefixMap = {
  products: "products:*",
  categories: "categories:*",
  users: "users:*",
};

export const clearCacheByPrefix = async (prefixKey) => {
  try {
    const pattern = prefixMap[prefixKey];
    if (!pattern) {
      return;
    }

    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`🧹 Cleared cache for ${prefixKey}`);
    }
  } catch (err) {
    console.error("Cache clear error:", err);
  }
};
