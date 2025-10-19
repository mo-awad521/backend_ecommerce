import { addAbortListener } from "nodemailer/lib/xoauth2";
import prisma from "./src/config/db";

const createOrderFromCart = async (userId, paymentMethod) => {
  return await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.length === 0) {
      throw new Error("Cart is Empty!");
    }
    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock with this product ${item.product.title}`);
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
        where: {
          id: item.productId,
        },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    return order;
  });
};
