// src/config/logger.js
import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(process.cwd(), "logs");

// Create a logs folder if it doesn't already exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, _json } = winston.format;

//Custom format for text records
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level.toUpperCase()}: ${stack || message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), logFormat),
  transports: [
    // Displayed in console during development
    new winston.transports.Console({
      format: combine(colorize(), timestamp(), logFormat),
    }),

    // Save errors in a special file
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),

    // Save all records
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),

    // A log for HTTP requests (we will add it shortly)
    new winston.transports.File({
      filename: path.join(logDir, "requests.log"),
      level: "http",
    }),
  ],
});

export default logger;
