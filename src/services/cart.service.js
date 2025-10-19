import prisma from "../config/db.js";

export const getCartByUserId = async (userId) => {
  return await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
};

export const addItemToCart = async (userId, productId, quantity = 1) => {
  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });

  if (existingItem) {
    return await prisma.cartItem.update({
      where: { cartId_productId: { cartId: cart.id, productId } },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    return await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  return await prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
};

export const removeCartItem = async (cartItemId) => {
  return await prisma.cartItem.delete({ where: { id: cartItemId } });
};

export const clearCart = async (userId) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {return null;}
  return await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};
