/**
 * Custom Error class to handle API-specific errors.
 * This class extends the built-in Error class and includes additional properties
 * like statusCode, responseCode, isOperational, and stack for better error management.
 */
class ApiError extends Error {
  /**
   * Constructor for creating a new ApiError.
   *
   * @param {number} statusCode - The HTTP status code associated with the error.
   * @param {string} message - The error message to be sent in the response.
   * @param {boolean} [isOperational=true] - Flag to indicate if the error is operational (i.e., handled by the app).
   * @param {string} [stack=''] - Optional stack trace for debugging purposes.
   * @param {number} [responseCode=0] - Custom response code for specific error handling.
   * @param {Error} [error] - Custom response code for specific error handling.
   */
  constructor(statusCode, message, isOperational = true, stack = '', responseCode = 0,error) {
    super(message);
    
    // Ensuring the Error constructor is properly initialized
    this.name = this.constructor.name;
    this.statusCode = statusCode;           // HTTP status code (e.g., 404, 500)
    this.isOperational = isOperational;     // Flag to mark if error is expected/handled
    this.responseCode = responseCode;   
    this.error = error    // Custom response code (for custom error categories)
    
    // If the stack is provided, use it; otherwise, capture a fresh stack trace
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Serializes the error object for easier logging or response formatting.
   * @returns {Object} - Serialized error object.
   */
  toJSON() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      responseCode: this.responseCode,
      isOperational: this.isOperational,
      stack: this.isOperational ? this.stack : undefined, // Do not expose stack trace for operational errors
      error: this.error, // Do not expose stack trace for operational errors
    };
  }
}

export default ApiError;
