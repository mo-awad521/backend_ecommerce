// src/controllers/users.controller.js
import * as userService from "../services/users.service.js";
import { ResponseStatus, CustomResponse } from "../utils/customResponse.js";

export const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    return res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "User Registered, please verify your email!",
          user
        )
      );
  } catch (error) {
    // لو الخطأ هو CustomResponse نرجعه مباشرة
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, token } = await userService.login(req.body);
    return res.status(ResponseStatus.OK.code).json(
      new CustomResponse(ResponseStatus.OK, "Login Successfully", {
        token,
        user,
      })
    );
  } catch (error) {
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await userService.verifyEmail(token);

    if (result.alreadyVerified) {
      return res
        .status(ResponseStatus.OK.code)
        .json(new CustomResponse(ResponseStatus.OK, result.message));
    }

    return res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Email verified successfully!", result));
  } catch (error) {
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await userService.resendVerificationEmail(email);
    return res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, result.message));
  } catch (error) {
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    await userService.requestPasswordReset(req.body.email);
    return res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Password reset email sent!"));
  } catch (error) {
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await userService.resetPassword(req.params.token, req.body.password);
    return res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Password reset successful!"));
  } catch (error) {
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.userId);
    return res.status(ResponseStatus.OK.code).json(user);
  } catch (error) {
    if (error instanceof CustomResponse) {
      return res.status(error.status.code).json(error);
    }
    next(error);
  }
};

//------------ Admin Features -----------------

// ✅ جلب جميع المستخدمين
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "All Users", users));
  } catch (error) {
    next(error);
  }
};

// ✅ جلب مستخدم واحد
export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res
        .status(ResponseStatus.NOT_FOUND.code)
        .json(new CustomResponse(ResponseStatus.NOT_FOUND, "User Not Found! "));
    }
    res.status(ResponseStatus.OK.code).json(new CustomResponse(ResponseStatus.OK, "User", user));
  } catch (error) {
    next(error);
  }
};

// ✅ تحديث دور المستخدم
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res
        .status(ResponseStatus.BAD_REQUEST.code)
        .json(new CustomResponse(ResponseStatus.BAD_REQUEST, "Role is required"));
    }

    const updatedUser = await userService.updateUserRole(req.params.id, role);
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Role Update Successfully!", updatedUser));
  } catch (error) {
    next(error);
  }
};

// delete user
export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json(new CustomResponse(ResponseStatus.OK, "Deleted"));
  } catch (error) {
    next(error);
  }
};
