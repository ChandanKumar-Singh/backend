import Joi from "joi";
import ResponseCodes from "../config/ResponseCodes.js";
import ApiError from "./ApiError.js";
import httpStatus from "http-status";
import resConv from "../utils/resConv.js";
import Constants from "../config/constants.js";



const SchemaValidator = (schema) => async (req, res, next) => {
  try {
    const reqs = {
      ...req.body,
      ...req.query,
      ...req.params,
    };
    console.log("🔍 SchemaValidator Request Data:", reqs);
    let validSchema = {};
    if (schema.body) validSchema = { ...validSchema, ...schema.body };
    if (schema.query) validSchema = { ...validSchema, ...schema.query };
    if (schema.params) validSchema = { ...validSchema, ...schema.params };
    validSchema = {
      ...validSchema,
      timezone: Joi.string().optional().default(Constants.TIME_ZONE_NAME),
    }
    const { value, error } = Joi.object(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(reqs);

    if (error) {
      let errors = {};
      const errorMessage = error.details
        .map((detail) => {
          const field = detail.path.join(".");
          const message = detail.message.replace(/\"/g, "");
          errors[field] = message;
          return `The "${field}" field ${message}`;
        })
        .join("; ");
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        ResponseCodes.ERROR.VALIDATION_FAILED,
        true,
        null,
        0,
        errors
      );
      return res
        .status(httpStatus.BAD_REQUEST)
        .send(resConv(errors, ResponseCodes.ERROR.VALIDATION_FAILED, 0, new Error().stack));
    }

    Object.assign(req.body, value);
    req.body = {
      ...req.body,
      ...req.params,
      ...req.query,
      timezone: req.headers.timezone || Constants.TIME_ZONE_NAME,
    }
    console.log("🔍 Validated Data:", req.body);
    return next();
  } catch (err) {
    return next(err);
  }
};

export default SchemaValidator;