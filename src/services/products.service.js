import prisma from "../config/db.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";

export const getProducts = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    order = "desc",
    inStock,
  } = query;

  const skip = (page - 1) * limit;
  const take = parseInt(limit);

  const where = {
    AND: [
      search
        ? {
            OR: [{ title: { contains: search } }, { description: { contains: search } }],
          }
        : {},
      categoryId ? { categoryId: Number(categoryId) } : {},
      minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
      maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
      inStock === "true" ? { stock: { gt: 0 } } : {},
    ],
  };

  const total = await prisma.product.count({ where });

  const products = await prisma.product.findMany({
    where,
    skip,
    take,
    orderBy: { [sortBy]: order },
    include: {
      category: true,
      images: true,
    },
  });

  return {
    page: Number(page),
    limit: take,
    total,
    totalPages: Math.ceil(total / take),
    products,
  };
};

export const getAllProducts = async (filters = {}) => {
  return await prisma.product.findMany({
    where: filters,
    include: { category: true, images: true },
  });
};

export const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true, images: true },
  });
};

export const createProduct = async (data, files) => {
  const { title, description, price, stock, categoryId } = data;

  const slug = slugify(title, { lower: true, strict: true });

  const uploadPromises = files.map((file) =>
    cloudinary.uploader
      .upload_stream({ folder: "products" }, (error, result) => {
        if (error) {
          throw error;
        }
        return result.secure_url;
      })
      .end(file.buffer)
  );

  const urls = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          );
          stream.end(file.buffer);
        })
    )
  );

  const product = await prisma.product.create({
    data: {
      title,
      slug,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: categoryId ? parseInt(categoryId) : null,
      images: {
        create: urls.map((url) => ({ url })),
      },
    },
    include: { images: true },
  });

  return product;
};

export const updateProduct = async (id, data, files) => {
  const { title, description, price, stock, categoryId } = data;

  const slug = title ? slugify(title, { lower: true, strict: true }) : undefined;

  let newImages = [];
  if (files && files.length > 0) {
    newImages = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({ url: result.secure_url });
                }
              }
            );
            stream.end(file.buffer);
          })
      )
    );
  }

  if (newImages.length > 0) {
    const oldImages = await prisma.productImage.findMany({
      where: { productId: Number(id) },
    });

    for (const img of oldImages) {
      const publicId = img.url.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (err) {
        console.error("❌ Failed to delete from Cloudinary:", err.message);
      }
    }

    await prisma.productImage.deleteMany({
      where: { productId: Number(id) },
    });
  }

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      title,
      slug,
      description,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      ...(newImages.length > 0 && {
        images: {
          create: newImages, // الصور الجديدة
        },
      }),
    },
    include: { images: true },
  });

  return updatedProduct;
};

export const updateProductWithoutDeleteOldImage = async (id, data, files) => {
  const { title, description, price, stock, categoryId } = data;

  const slug = title ? slugify(title, { lower: true, strict: true }) : undefined;

  let newImages = [];
  if (files && files.length > 0) {
    newImages = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve({ url: result.secure_url });
                }
              }
            );
            stream.end(file.buffer);
          })
      )
    );
  }

  const updatedProduct = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      title,
      slug,
      description,
      price: price ? parseFloat(price) : undefined,
      stock: stock ? parseInt(stock) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      ...(newImages.length > 0 && {
        images: {
          create: newImages, // يضيف الصور الجديدة جنب القديمة
        },
      }),
    },
    include: { images: true },
  });

  return updatedProduct;
};

export const deleteProduct = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { images: true },
  });

  if (!product) {
    throw new Error("❌ Product not found");
  }

  for (const img of product.images) {
    try {
      const publicId = img.url.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    } catch (err) {
      console.error("⚠️ Failed to delete image from Cloudinary:", err.message);
    }
  }

  const deletedProduct = await prisma.product.delete({
    where: { id: Number(id) },
  });

  return deletedProduct;
};
