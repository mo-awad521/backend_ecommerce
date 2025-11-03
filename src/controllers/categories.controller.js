import { categoryService } from "../services/index.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Categories", categories));
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    // if (!category) {
    //   return res
    //     .status(ResponseStatus.NOT_FOUND.code)
    //     .json(
    //       new CustomResponse(
    //         ResponseStatus.NOT_FOUND,
    //         `Category with ID:${req.params.id} not found`
    //       )
    //     );
    // }

    // res
    //   .status(ResponseStatus.OK.code)
    //   .json(
    //     new CustomResponse(
    //       ResponseStatus.OK,
    //       `Category With ID:${req.params.id}`,
    //       category
    //     )
    //   );
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, `Category With ID:${req.params.id}`, category));
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(
        new CustomResponse(
          ResponseStatus.RESOURCE_CREATED,
          "Category Created Successfully",
          category
        )
      );
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Cteagroy Updated Successfully ", category));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json(new CustomResponse(ResponseStatus.OK, "Deleted"));
  } catch (error) {
    next(error); //pass the error to the errorHandler
  }
};
