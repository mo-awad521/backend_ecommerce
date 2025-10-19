import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { xss } from "express-xss-sanitizer";
import logger from "./config/logger.js";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { emailQueue } from "./jobs/index.js"; // your queue

import userRoutes from "./routes/users.routes.js";
import categoryRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.route.js";
import orderRoutes from "./routes/orders.routes.js";
import paymentRoutes from "./routes/payments.routes.js";
import addressRoutes from "./routes/addresses.routes.js";
import wishlistRoutes from "./routes/wishlists.routes.js";
import reviewRoutes from "./routes/reviews.routes.js";
import reportRoutes from "./routes/reports.routes.js";
import jobRouter from "./routes/jobs.routes.js";

import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100, // عدد الطلبات المسموح بها لكل IP
  message: "Too many requests, please try again later.",
});

app.use(limiter);

// استخدم morgan لتمرير الطلبات إلى winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream,
  })
);

// Create the Bull Board server adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

// Create Bull Board dashboard
createBullBoard({
  queues: [new BullMQAdapter(emailQueue)],
  serverAdapter,
});

// Mount the admin dashboard
app.use("/admin/queues", serverAdapter.getRouter());
//http://localhost:3000/admin/queues

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api", reportRoutes);
app.use("/api/jobs", jobRouter);

// ✅ Error handler
app.use(errorHandler);

export default app;
