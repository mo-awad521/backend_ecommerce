import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  // 1️⃣ Users
  const alice = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@example.com",
      password: passwordHash,
      role: "CUSTOMER",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob",
      email: "bob@example.com",
      password: passwordHash,
      role: "CUSTOMER",
    },
  });

  const _admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
    },
  });

  // 2️⃣ Addresses
  await prisma.address.createMany({
    data: [
      {
        userId: alice.id,
        street: "Main Street 1",
        city: "Vienna",
        country: "Austria",
        postalCode: "1010",
      },
      {
        userId: bob.id,
        street: "Baker Street 221B",
        city: "London",
        country: "UK",
        postalCode: "NW1",
      },
    ],
  });

  // 3️⃣ Categories
  const electronics = await prisma.category.create({
    data: { name: "Electronics", description: "Devices and gadgets" },
  });

  const fashion = await prisma.category.create({
    data: { name: "Fashion", description: "Clothes and accessories" },
  });

  const books = await prisma.category.create({
    data: { name: "Books", description: "Fiction and non-fiction" },
  });

  // 4️⃣ Products
  const productsData = [
    {
      title: "iPhone 15",
      description: "Latest Apple smartphone",
      price: 1200,
      stock: 20,
      categoryId: electronics.id,
    },
    {
      title: "MacBook Pro",
      description: "Apple laptop",
      price: 2200,
      stock: 15,
      categoryId: electronics.id,
    },
    {
      title: "Leather Jacket",
      description: "Stylish men's jacket",
      price: 200,
      stock: 10,
      categoryId: fashion.id,
    },
    {
      title: "Sneakers",
      description: "Comfortable running shoes",
      price: 120,
      stock: 30,
      categoryId: fashion.id,
    },
    {
      title: "Atomic Habits",
      description: "Bestseller book on habits",
      price: 25,
      stock: 50,
      categoryId: books.id,
    },
    {
      title: "Clean Code",
      description: "Programming best practices",
      price: 40,
      stock: 40,
      categoryId: books.id,
    },
  ];

  const products = await Promise.all(
    productsData.map((p) =>
      prisma.product.create({
        data: {
          ...p,
          slug: slugify(p.title, { lower: true, strict: true }),
        },
      })
    )
  );

  // 5️⃣ Carts + CartItems
  const cartAlice = await prisma.cart.create({ data: { userId: alice.id } });
  const cartBob = await prisma.cart.create({ data: { userId: bob.id } });

  await prisma.cartItem.createMany({
    data: [
      { cartId: cartAlice.id, productId: products[0].id, quantity: 2 }, // iPhone
      { cartId: cartAlice.id, productId: products[4].id, quantity: 1 }, // Atomic Habits
      { cartId: cartBob.id, productId: products[2].id, quantity: 1 }, // Jacket
      { cartId: cartBob.id, productId: products[5].id, quantity: 2 }, // Clean Code
    ],
  });

  // 6️⃣ Orders + OrderItems
  const orderAlice1 = await prisma.order.create({
    data: {
      userId: alice.id,
      totalAmount: 2400,
      status: "PAID",
      paymentMethod: "CREDIT_CARD",
      items: {
        create: [{ productId: products[0].id, quantity: 2, price: 1200 }],
      },
    },
  });

  const orderAlice2 = await prisma.order.create({
    data: {
      userId: alice.id,
      totalAmount: 25,
      status: "PENDING",
      paymentMethod: "PAYPAL",
      items: {
        create: [{ productId: products[4].id, quantity: 1, price: 25 }],
      },
    },
  });

  const orderBob1 = await prisma.order.create({
    data: {
      userId: bob.id,
      totalAmount: 440,
      status: "SHIPPED",
      paymentMethod: "BANK_TRANSFER",
      items: {
        create: [
          { productId: products[2].id, quantity: 1, price: 200 },
          { productId: products[5].id, quantity: 2, price: 40 },
        ],
      },
    },
  });

  // 7️⃣ Payments
  await prisma.payment.createMany({
    data: [
      {
        orderId: orderAlice1.id,
        provider: "STRIPE",
        transactionId: "txn_123",
        status: "SUCCESS",
      },
      {
        orderId: orderAlice2.id,
        provider: "PAYPAL",
        transactionId: "txn_124",
        status: "PENDING",
      },
      {
        orderId: orderBob1.id,
        provider: "BANK",
        transactionId: "txn_125",
        status: "SUCCESS",
      },
    ],
  });
  // 8️⃣ Wishlist
  await prisma.wishlist.createMany({
    data: [
      {
        userId: alice.id,
        productId: products[0].id, // iPhone 15
      },
      {
        userId: alice.id,
        productId: products[4].id, // Atomic Habits
      },
      {
        userId: bob.id,
        productId: products[2].id, // Leather Jacket
      },
    ],
  });

  console.log("✅ Database seeded successfully with enums!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
