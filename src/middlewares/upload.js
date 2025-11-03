// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: "ecommerce_products",
//     allowed_formats: ["jpg", "png", "jpeg", "webp"],
//   },
// });

import multer from "multer";

// We store it in memory (buffer) so that we can upload it directly to Cloudinary
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for every image
});
