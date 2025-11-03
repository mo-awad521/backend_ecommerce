import request from "supertest";
import app from "../src/app.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

beforeEach(async () => {
  console.log("🧹 Resetting test DB...");
  await prisma.review.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  console.log("🛑 Disconnecting test DB...");
  await prisma.$disconnect();
});

describe("E2E - User Auth", () => {
  it("should register a new user", async () => {
    const res = await request(app).post("/api/users/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User Registered, please verify your email!");
    expect(res.body.data).toHaveProperty("isVerified", false);
  }, 10000);

  it("should login successfully with correct credentials", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // ⬇️ create verified user
    await prisma.user.create({
      data: {
        name: "Verified User",
        email: "verified@example.com",
        password: hashedPassword,
        isVerified: true,
      },
    });

    const res = await request(app).post("/api/users/login").send({
      email: "verified@example.com",
      password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status");
    expect(res.body).toHaveProperty("message", "Login Successfully");
    expect(res.body.data).toHaveProperty("token");
  }, 10000);

  it("should fail with wrong password", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Wrong Password User",
        email: "wrongpass@example.com",
        password: hashedPassword,
        isVerified: true,
      },
    });

    const res = await request(app).post("/api/users/login").send({
      email: "wrongpass@example.com",
      password: "wrongPassword",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "Login Failed");
  }, 10000);

  it("should fail if user is not verified", async () => {
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    // ⬇️ create unverified user
    await prisma.user.create({
      data: {
        name: "Unverified User",
        email: "unverified@example.com",
        password: hashedPassword,
        isVerified: false,
      },
    });

    const res = await request(app).post("/api/users/login").send({
      email: "unverified@example.com",
      password,
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("message", "Please verify your email first");
  }, 10000);
});
