import jwt from "jsonwebtoken";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    {return res
      .status(ResponseStatus.UNAUTHORIZED.code)
      .json(
        new CustomResponse(ResponseStatus.UNAUTHORIZED, "No token provided")
      );}

  const token = authHeader.split(" ")[1]; // Bearer <token>
  //{ error: "Invalid token format" }
  if (!token)
    {return res
      .status(ResponseStatus.UNAUTHORIZED.code)
      .json(
        new CustomResponse(ResponseStatus.UNAUTHORIZED, "Invalid token format")
      );}

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    //console.log(decoded);
    next();
  } catch (error) {
    return res
      .status(ResponseStatus.FORBIDDEN.code)
      .json(
        new CustomResponse(ResponseStatus.FORBIDDEN, "Invalid or expired token")
      );

    //{ error: "Invalid or expired token" }
  }
};

export const isAdmin = (req, _res, next) => {
  if (req.user.role !== "ADMIN") {
    return _res
      .status(ResponseStatus.FORBIDDEN.code)
      .json(
        new CustomResponse(ResponseStatus.FORBIDDEN, "Admin access required")
      );
  }
  next();
};

export const isCustomer = (req, res, next) => {
  if (req.user.role !== "CUSTOMER") {
    new CustomResponse(ResponseStatus.FORBIDDEN, "Customer access required");
  }
  next();
};
