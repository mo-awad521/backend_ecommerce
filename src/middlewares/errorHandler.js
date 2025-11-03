// middlewares/errorHandler.js
import logger from "../config/logger.js";
import { ResponseStatus, CustomResponse } from "../utils/customResponse.js";

export const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} - ${req.method} ${req.url}`);
  console.error("Error caught:", err);

  // Prisma: Record not found
  if (err.code === "P2025") {
    return res
      .status(ResponseStatus.NOT_FOUND.code)
      .json(new CustomResponse(ResponseStatus.NOT_FOUND, ` ${err.meta.modelName} not found`));
  }

  // Prisma: Unique constraint failed
  if (err.code === "P2002") {
    return res
      .status(ResponseStatus.BAD_REQUEST.code)
      .json(
        new CustomResponse(
          ResponseStatus.BAD_REQUEST,
          "Unique constraint failed",
          err.meta?.target || undefined
        )
      );
  }

  // Prisma: Foreign key constraint failed
  if (err.code === "P2003") {
    return res
      .status(ResponseStatus.BAD_REQUEST.code)
      .json(new CustomResponse(ResponseStatus.BAD_REQUEST, "Foreign key constraint failed"));
  }

  // Prisma: Value too long for column
  if (err.code === "P2000") {
    return res
      .status(ResponseStatus.BAD_REQUEST.code)
      .json(
        new CustomResponse(
          ResponseStatus.BAD_REQUEST,
          "Value too long for column",
          err.meta?.column_name
        )
      );
  }

  // Prisma: Invalid value for a field
  if (err.code === "P2004") {
    return res
      .status(ResponseStatus.BAD_REQUEST.code)
      .json(
        new CustomResponse(
          ResponseStatus.BAD_REQUEST,
          "Invalid value for field",
          err.meta?.field_name
        )
      );
  }

  // أي خطأ آخر غير معروف
  res
    .status(ResponseStatus.INTERNAL_SERVER_ERROR.code)
    .json(
      new CustomResponse(
        ResponseStatus.INTERNAL_SERVER_ERROR,
        "Unexpected server error",
        err.message
      )
    );
  next();
};

export default errorHandler;
