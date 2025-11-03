import { addressService } from "../services/index.js";
import { CustomResponse, ResponseStatus } from "../utils/customResponse.js";

export const getAddresses = async (req, res) => {
  try {
    const addresses = await addressService.getAddressesByUser(req.user.userId);
    res.json(new CustomResponse(ResponseStatus.OK, "User Address", addresses));
  } catch (_error) {
    res
      .status(ResponseStatus.INTERNAL_SERVER_ERROR.code)
      .json(new CustomResponse(ResponseStatus.INTERNAL_SERVER_ERROR, CustomResponse));
  }
};

export const createAddress = async (req, res) => {
  try {
    const address = await addressService.createAddress(req.user.userId, req.body);
    res
      .status(ResponseStatus.RESOURCE_CREATED.code)
      .json(new CustomResponse(ResponseStatus.RESOURCE_CREATED, "Add a new Address", address));
  } catch (error) {
    res
      .status(ResponseStatus.BAD_REQUEST.code)
      .json(new CustomResponse(ResponseStatus.BAD_REQUEST, error.message));
    //{ error: error.message }
  }
};

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId; //  from JWT or session
    const { id } = req.params; // address id
    const updated = await addressService.updateAddress(userId, parseInt(id), req.body);
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, "Address Updated Successfully", updated));
  } catch (err) {
    res
      .status(ResponseStatus.FORBIDDEN.code)
      .json(new CustomResponse(ResponseStatus.FORBIDDEN, err.message));
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    //console.log(userId);
    //console.log(id);
    await addressService.deleteAddress(userId, parseInt(id));
    res
      .status(ResponseStatus.OK.code)
      .json(new CustomResponse(ResponseStatus.OK, `address with id:${id} has been deleted`));
  } catch (err) {
    res
      .status(ResponseStatus.FORBIDDEN.code)
      .json(new CustomResponse(ResponseStatus.FORBIDDEN, err.message));
  }
};
