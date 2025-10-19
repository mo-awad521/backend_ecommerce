import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import logger from "./src/config/logger.js";
import "./src/jobs/index.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
logger.info("✅ Application started successfully");
