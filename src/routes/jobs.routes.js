// src/routes/jobs.routes.js
import express from "express";
import { emailQueue } from "../jobs/index.js";

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, subject, message } = req.body;

  await emailQueue.add("sendEmail", { to, subject, message });

  res.json({
    message: "📨 Email job added to queue!",
    job: { to, subject },
  });
});

export default router;
