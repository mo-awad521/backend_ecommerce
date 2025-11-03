// src/services/users.service.js
import prisma from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";
import crypto from "crypto";
import sendEmail from "../utils/sendEmail.js"; // utils لارسال الايميل

export const register = async ({ name, email, password, role = "CUSTOMER" }) => {
  if (await prisma.user.findUnique({ where: { email } })) {
    throw new CustomResponse(ResponseStatus.FORBIDDEN, "Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // ساعة

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationTokenExpires,
    },
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  await sendEmail(
    email,
    "Verify Your Account",
    `Click here to verify your account: ${verificationUrl}`
  );

  return user;
};

export const verifyEmail = async (token) => {
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  });

  if (!user) {
    throw new CustomResponse(ResponseStatus.NOT_FOUND, "Invalid or expired token");
  }

  if (user.isVerified) {
    return { alreadyVerified: true, message: "Account already verified" };
  }

  if (user.verificationTokenExpires < new Date()) {
    throw new CustomResponse(ResponseStatus.FORBIDDEN, "Token expired");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  return updatedUser;
};

export const resendVerificationEmail = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new CustomResponse(ResponseStatus.NOT_FOUND, "User not found");
  }

  if (user.isVerified) {
    throw new CustomResponse(ResponseStatus.BAD_REQUEST, "Account already verified");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  await sendEmail(
    user.email,
    "Verify Your Account (Reaset lintk)",
    `Click here to verify your account: ${verificationUrl}`
  );

  return { message: "Verification email resent successfully" };
};

export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new CustomResponse(ResponseStatus.NOT_FOUND, "User not found");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expires,
    },
  });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail(email, "Reset Password", `Reset your password here: ${resetUrl}`);

  return true;
};

export const resetPassword = async (token, newPassword) => {
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    throw new CustomResponse(ResponseStatus.NOT_FOUND, "Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return true;
};

// ---------- Important requirement: login (unified) ----------
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new CustomResponse(ResponseStatus.BAD_REQUEST, "Login Failed");
  }

  if (!user.isVerified) {
    throw new CustomResponse(ResponseStatus.FORBIDDEN, "Please verify your email first");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new CustomResponse(ResponseStatus.BAD_REQUEST, "Login Failed");
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  // Here we return a clear object (we don't wrap it in CustomResponse) — the Controller will handle constructing the response
  return { user, token };
};

export const getProfile = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: { addresses: true },
  });
};

//------------ Admin Features -----------------

// 🔹 جلب جميع المستخدمين
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

// 🔹 جلب مستخدم واحد
export const getUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

// 🔹 تحديث دور المستخدم
export const updateUserRole = async (id, role) => {
  return prisma.user.update({
    where: { id: parseInt(id) },
    data: { role },
  });
};

// 🔹  حذف المستخدم
export const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  });

  if (!user) {
    throw new Error("❌ User not found");
  }
  const deletedUser = await prisma.user.delete({
    where: { id: Number(id) },
  });

  return deletedUser;
};
