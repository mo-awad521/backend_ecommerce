// src/config/logger.js
import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");

// إنشاء مجلد logs إن لم يكن موجود
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, _json } = winston.format;

// تنسيق مخصص للسجلات النصية
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // عرض في الـ console أثناء التطوير
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),

    // حفظ الأخطاء في ملف خاص
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    // حفظ جميع السجلات
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),

    // سجل خاص بطلبات HTTP (سنضيفه بعد قليل)
    new winston.transports.File({
      filename: path.join(logDir, "requests.log"),
      level: "http",
    }),
  ],
});

export default logger;
