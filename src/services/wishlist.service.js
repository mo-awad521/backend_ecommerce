import prisma from "../config/db.js";

export async function addToWishlist(userId, productId) {
  return prisma.wishlist.create({
    data: { userId, productId },
  });
}

export const addToWishList = async (userId, productId) => {
  return await prisma.wishlist.create({
    data: { userId, productId },
  });
};

export async function removeFromWishlist(userId, productId) {
  return prisma.wishlist.deleteMany({
    where: { userId, productId },
  });
}

export async function getWishlist(userId) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: { product: true },
  });
}
