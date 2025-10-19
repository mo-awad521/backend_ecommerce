// src/jobs/queues/emailQueue.js
import { Queue } from "bullmq";
import redisClient from "../../config/redis.js";

export const emailQueue = new Queue("emailQueue", {
  connection: redisClient,
});
