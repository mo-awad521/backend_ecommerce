import prisma from "../config/db.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const createOrderFromCart = async (userId, paymentMethod) => {
  return await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock for product ${item.product.title}`);
      }
      totalAmount += item.quantity * item.product.price;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      };
    });

    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        paymentMethod,
        items: { create: orderItems },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  });
};

export const getUserOrders = async (userId) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// export const getOrdersByUser = async (userId) => {
//   return await prisma.order.findMany({
//     where: { userId },
//     include: { items: { include: { product: true } }, payment: true },
//   });
// };
//

// get user by id
export const getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { include: { product: true } },
      payment: true,
    },
  });

  if (!order) {
    throw new Error("Order not found or not authorized");
  }

  return order;
};

//cancel order
export const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new Error("Order not found or not authorized");
  }
  if (order.status !== "PENDING") {
    throw new Error("Only pending orders can be canceled");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELED" },
  });
};

const allowedTransitions = {
  PENDING: ["PAID", "CANCELED"],
  PAID: ["SHIPPED", "CANCELED"],
  SHIPPED: ["DELIVERED", "RETURNED"],
  DELIVERED: ["COMPLETED", "RETURNED"],
};

//useed
export const changeOrderStatus = async (actorUserId, actorRole, orderId, newStatus) => {
  // normalize
  const orderIdNum = Number(orderId);
  if (!orderIdNum) {
    const error = new Error("Invalid order id");
    error.status = 400;
    throw error;
  }

  // تحميل الطلب الحالي
  const order = await prisma.order.findUnique({ where: { id: orderIdNum } });
  if (!order) {
    const e = new Error("Order not found");
    e.status = 404;
    throw e;
  }

  const currentStatus = order.status;

  // تأكد أن newStatus صحيحة (واحدة من enum)
  const normalizedStatus = newStatus.toUpperCase();
  const validStatuses = Object.keys(allowedTransitions);
  if (!validStatuses.includes(normalizedStatus)) {
    const e = new Error("Invalid status value");
    e.status = 400;
    throw e;
  }

  // إذا الفاعل ليس أدمن:
  // - يسمح للـ owner فقط بإلغاء الطلب (cancelled) ضمن حالات محددة
  if (actorRole !== "ADMIN") {
    if (order.userId !== actorUserId) {
      const e = new Error("Not authorized to change this order");
      e.status = 403;
      throw e;
    }

    // العميل يستطيع فقط طلب إلغاء الطلب (cancelled) عندما يكون الطلب في pending أو processing
    if (newStatus !== "CANCELED") {
      const e = new Error(
        "Customers can only cancel their orders; status changes must be done by admin"
      );
      e.status = 403;
      throw e;
    }

    if (!["PENDING", "processing"].includes(currentStatus)) {
      const e = new Error(`Cannot cancel order in "${currentStatus}" state`);
      e.status = 400;
      throw e;
    }
  } else {
    // إذا الفاعل admin: يتحقق من صحة الانتقال حسب allowedTransitions
    const allowed = allowedTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      const e = new Error(`Invalid status transition from "${currentStatus}" to "${newStatus}"`);
      e.status = 400;
      throw e;
    }
  }

  // تنفّذ التحديث
  const updated = await prisma.order.update({
    where: { id: orderIdNum },
    data: { status: newStatus },
    include: {
      items: { include: { product: true } },
      payment: true,
      user: true,
    },
  });

  return updated;
};

// ######################################################################
// unused now ---!!!!
// export async function updateOrderStatus(orderId, newStatus, user) {
//   const order = await prisma.order.findUnique({ where: { id: orderId } });
//   if (!order) {
//     throw new Error("Order not found");
//   }

//   // تحقق أن العميل يملك الطلب أو أنه admin
//   if (user.role !== "ADMIN" && order.userId !== user.id) {
//     throw new Error("Not authorized to update this order");
//   }

//   const validNext = allowedTransitions[order.status] || [];
//   if (!validNext.includes(newStatus)) {
//     throw new Error(`Invalid transition from ${order.status} to ${newStatus}`);
//   }

//   return prisma.order.update({
//     where: { id: orderId },
//     data: { status: newStatus },
//   });
// }
// ######################################################################

//---------------------- Admin Featuers --------------------------

export const getAllOrders = async (filters = {}) => {
  const { status, page = 1, limit = 10 } = filters;

  const where = status ? { status } : {};
  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const total = await prisma.order.count({ where });

  const orders = await prisma.order.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, title: true, price: true } },
        },
      },
      payment: true,
    },
  });

  return {
    page: Number(page),
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    orders,
  };
};
