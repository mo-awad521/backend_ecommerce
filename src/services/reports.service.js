import prisma from "../config/db.js";

export const getDashboardStats = async () => {
  // 1️⃣ Number of users
  const totalUsers = await prisma.user.count();

  // 2️⃣ Number of orders
  const totalOrders = await prisma.order.count();

  // 3️⃣ Number of requests according to the situation
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // 4️⃣ Total successful sales (from orders that have been paid for SUCCESS)
  const successfulRevenue = await prisma.order.aggregate({
    where: {
      payment: {
        status: "SUCCESS",
      },
    },
    _sum: {
      totalAmount: true,
    },
  });

  // 5️⃣ Top 5 best-selling products
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const productsDetails = await Promise.all(
    topProducts.map(async (p) => {
      const product = await prisma.product.findUnique({
        where: { id: p.productId },
        select: { id: true, title: true, price: true },
      });
      return { ...product, totalSold: p._sum.quantity };
    })
  );

  // ✅ Final Result
  return {
    users: { total: totalUsers },
    orders: { total: totalOrders, byStatus: ordersByStatus },
    sales: {
      totalRevenue: successfulRevenue._sum.totalAmount?.toString() || "0.00",
    },
    topProducts: productsDetails,
  };
};
