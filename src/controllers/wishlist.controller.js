import { wishlistService } from "../services/index.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const addWishlist = async (req, res, next) => {
  try {
    const result = await wishlistService.addToWishlist(req.user.userId, req.body.productId);
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(new CustomResponse(ResponseStatus.RESOURCE_CREATED, "item added to wishlist", result));
  } catch (error) {
    next(error);
  }
};

export const removeWishlist = async (req, res, next) => {
  try {
    await wishlistService.removeFromWishlist(req.user.id, parseInt(req.params.productId));
    res.json(new CustomResponse(ResponseStatus.OK, "Removed from wishlist"));
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.id);
    res.json(new CustomResponse(ResponseStatus.OK, "wishlist", wishlist));
  } catch (error) {
    next(error);
  }
};
