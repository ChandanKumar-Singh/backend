import Joi from "joi";
import ApiError from "./ApiError.js";
import httpStatus from "http-status";
import resConv from "../utils/resConv.js";
import ResponseCodes from "../config/ResponseCodes.js";

// SchemaValidator middleware to validate req.body, req.query, and req.params
const SchemaValidator = (schema) => async (req, res, next) => {
  try {
    const validSchema = {
      ...schema.body,
      ...schema.query,
      ...schema.params,
    };
    const reqs = {
      ...req.body,
      ...req.query,
      ...req.params,
    };

    // Validate request using Joi
    const { value, error } = Joi.object(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(reqs);

    if (error) {
      var errors = {};
      const errorMessage = error.details
        .map((detail) => {
          const field = detail.path.join(".");
          const message = detail.message.replace(/\"/g, "");
          errors[field] = message;
          return `The "${field}" field ${message}`;
        })
        .join("; "); // Better separator for readability

      return res.status(httpStatus.BAD_REQUEST).send(resConv(errors, ResponseCodes.ERROR.VALIDATION_FAILED));
    }

    // Assign validated values to the request object
    Object.assign(req, value);
    return next();
  } catch (err) {
    return next(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred during validation."
      )
    );
  }
};

export default SchemaValidator;
