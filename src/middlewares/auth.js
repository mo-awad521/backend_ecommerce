import jwt from "jsonwebtoken";
import { CustomResponse, ResponseStatus } from "../utils/customResponse";

export const auth = (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return next({ status: 401, message: "Unauthorized" });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (_e) {
    next(new CustomResponse(ResponseStatus.UNAUTHORIZED.code, "Invalid or expired token"));
    //{ status: 401, message: "Invalid token" }
  }
};

export const isAdmin = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    return next({ status: 403, message: "Admin only" });
  }
  next();
};
