import { productService } from "../services/index.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";
import logger from "../config/logger.js";
import { deleteCache } from "../utils/cache.js";

export const getProducts = async (req, res, next) => {
  try {
    logger.info(`Fetching all porducts by ${req.user?.email || "geust"}`);
    const products = await productService.getProducts(req.query);

    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Products fetched", products));
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res
        .status(ResponseStatus.NOT_FOUND.code)
        .json(new CustomResponse(ResponseStatus.NOT_FOUND, "Not Found!"));
    }
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Product", product));
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.files);
    await deleteCache("products:{}");

    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "Product Created Successfully!",
          product
        )
      );
  } catch (error) {
    next(error);
  }
};
export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body, req.files);
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Success Update a Producct", product));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id);
    res.json(new CustomResponse(ResponseStatus.OK, "Deleted"));
  } catch (error) {
    next(error);
  }
};
