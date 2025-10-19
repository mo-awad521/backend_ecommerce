// src/jobs/index.js
import "./workers/emailWorker.js"; // فعّل الـ Worker
export * from "./queues/emailQueue.js"; // صدّر الـ Queue
