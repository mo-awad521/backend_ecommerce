// src/jobs/workers/emailWorker.js
import { Worker } from "bullmq";
import redisClient from "../../config/redis.js";
import logger from "../../config/logger.js";
import sendEmail from "../../utils/sendEmail.js";

export const emailWorker = new Worker(
  "emailQueue",
  async (job) => {
    const { to, subject, message } = job.data;

    logger.info(`📧 Sending email to: ${to} | Subject: ${subject}`);

    //  محاكاة عملية إرسال بريد إلكتروني
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    await sendEmail(to, subject, message);

    logger.info(`✅ Email sent successfully to ${to}`);
  },
  { connection: redisClient }
);

emailWorker.on("failed", (job, err) => {
  logger.error(`❌ Job ${job.id} failed: ${err.message}`);
});
