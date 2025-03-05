import Constants from '../config/constants.js';
import ResponseCodes from '../config/ResponseCodes.js';
import { logg, logger } from '../utils/logger.js';
import ApiError from './ApiError.js';
import resConv from '../utils/resConv.js';
import httpStatus from 'http-status';

/**
 * Centralized error handler middleware.
 * 
 * Handles both operational errors (known errors) and programming errors.
 */
export default function errorHandler(err, req, res, next) {
  if (!err) {
    handleUnknownError(res);
  } else if (err instanceof ApiError) {
    handleApiError(err, res);
  } else if (err.name === 'ValidationError') {
    handleValidationError(err, res);
  } else if (err.code === 11000) {
    handleDuplicateError(err, res);
  } else {
    handleUnexpectedError(err, res);
  }
}

/**
 * Handles unknown errors where no error object is passed.
 * @param {Object} res - The response object.
 */
function handleUnknownError(res) {
  loggError(null, 'Unknown error occurred');
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
    resConv(null, 'An unknown error occurred.', 0)
  );
}

/**
 * Handles ApiError type errors.
 * @param {Object} err - The ApiError object.
 * @param {Object} res - The response object.
 */
function handleApiError(err, res) {
  loggError(err, 'Non-operational error occurred:');
  return res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json(
    resConv(null, err.message || 'An error occurred', 0, {
      errorDetails: err.error || null,
      responseCode: err.responseCode || ResponseCodes.GENERAL_ERROR,
      stackTrace: Constants.IS_PRODUCTION ? null : err.stack, // Hide stack in production
    })
  );
}


/**
 * Handles validation errors (e.g., from Mongoose or other validation libraries).
 * @param {Object} err - The error object.
 * @param {Object} res - The response object.
 */
function handleValidationError(err, res) {
  loggError(err, 'Validation error occurred');

  return res.status(httpStatus.BAD_REQUEST).json(
    resConv(err.errors, 'Validation failed.', 0, {
      stackTrace: Constants.IS_PRODUCTION ? null : err.stack, // Hide stack in production
    })
  );
}

/**
 * Handles duplicate key errors (MongoDB).
 * @param {Object} err - The error object.
 * @param {Object} res - The response object.
 */
function handleDuplicateError(err, res) {

  loggError(err, 'Duplicate key error occurred');

  return res.status(httpStatus.BAD_REQUEST).json(
    resConv(extractDuplicateErrorMessage(err.errorResponse), 'Already exists', 0, {
      stackTrace: Constants.IS_PRODUCTION ? null : err.stack, // Hide stack in production
    })
  );
}

/**
 * Handles unexpected errors (e.g., programming bugs, unknown issues).
 * @param {Object} err - The error object.
 * @param {Object} res - The response object.
 */
function handleUnexpectedError(err, res) {
  loggError(err, 'Unexpected error occurred');
  return res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json(
    resConv(null, 'Internal server error.', 0, {
      errorDetails: Constants.IS_PRODUCTION ? null : err.stack, // Hide stack in production
      responseCode: ResponseCodes.SERVER_ERROR,
      stackTrace: Constants.IS_PRODUCTION ? null : err.stack, // Include stack trace for debugging in dev environments
    })
  );
}

/**
 * Extracts a readable message from a duplicate key error.
 * @param {Object} error - The error object containing details about the duplicate key.
 * @returns {string} - A message indicating the duplicate key error.
 */
function extractDuplicateErrorMessage(error) {
  // Check if the error is a duplicate key error
  if (error.code === 11000 && error.errmsg) {
    // Extract the key and value from the error message
    const match = error.errmsg.match(/dup key: \{ (.*?) \}/);
    if (match && match[1]) {
      // Extract key-value pair from the regex match
      const keyValue = match[1];
      const key = keyValue.split(':')[0].trim();
      const value = keyValue.split(':')[1].trim().replace(/"/g, ''); // Remove extra quotes

      // Return a formatted string with key and error details
      return `${key.charAt(0).toUpperCase() + key.slice(1)} with ${value} already exists.`;
    }
  }

  // If the error is not a duplicate key error or doesn't match the pattern, return a generic message
  return 'An error occurred. Please check the error details.';
}

/**
 * 
 * @param {Object} err  - The error object.
 * @param {string} reason  - The reason for the error.
 */
function loggError(err, reason) {
  if (!err.isOperational && Constants.envs.production) {
    logger.error(err.message || reason, {
      // message: err.message,
      // statusCode: err.statusCode,
      // responseCode: err.responseCode,
      stack: err.stack,
    });
  }else{
    console.error(err)
  }
}
