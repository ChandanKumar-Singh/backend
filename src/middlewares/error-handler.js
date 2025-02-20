import Constants from '../config/constants.js';
import ResponseCodes from '../config/ResponseCodes.js';
import { logger } from '../utils/logger.js';
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
  logger.error('An unknown error occurred.');
  return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
    resConv(null, 0, 'An unknown error occurred.')
  );
}

/**
 * Handles ApiError type errors.
 * @param {Object} err - The ApiError object.
 * @param {Object} res - The response object.
 */
function handleApiError(err, res) {
  // Log unexpected ApiErrors (non-operational errors)
  if (!err.isOperational) {
    logger.error('Non-operational error occurred:', {
      message: err.message,
      statusCode: err.statusCode,
      responseCode: err.responseCode,
      stack: err.stack,
    });
  }

  return res.status(err.statusCode || httpStatus.INTERNAL_SERVER_ERROR).json(
    resConv(null, 0, err.message || 'An error occurred', {
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
  logger.error('Validation error occurred:', {
    message: err.message,
    errors: err.errors,
    stack: err.stack,
  });

  return res.status(httpStatus.BAD_REQUEST).json(
    resConv(err.errors, 0, 'Validation failed.', {
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
  logger.error('Duplication error occurred:', {
    message: err.message,
    errors: err.errorResponse,
    stack: err.stack,
  });

  return res.status(httpStatus.BAD_REQUEST).json(
    resConv(extractDuplicateErrorMessage(err.errorResponse), 0, 'Already exists', {
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
  logger.error('Unexpected error occurred:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.status || httpStatus.INTERNAL_SERVER_ERROR,
  });

  return res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR).json(
    resConv(null, 0, 'Internal server error.', {
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
