/* import { logg } from "./logger.js";

const resConv = (data = null, message = '', code = 1, stackTrace, errorCode) => {
  // Default messages for common status codes
  const defaultMessages = {
    1: 'Success',
    0: 'Error',
    200: 'OK',
    400: 'Bad Request',
    401: 'Unauthorized Access',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };

  // Ensure message is set
  const responseMessage = message || defaultMessages[code] || 'Unknown Error';

  // Standard response format
  return code === 0
    ? { status: code, message: responseMessage, error: data, stackTrace, errorCode }
    : { status: code, message: responseMessage, data, stackTrace };
};

export default resConv;
 */


import { logg } from './logger.js';

/**
 * Converts internal response to a standardized format.
 * @param {Object} options
 * @param {*} options.data - Response data (for success).
 * @param {string} [options.message] - Custom message.
 * @param {number} [options.code=1] - Response code (1: success, 0: error, or HTTP code).
 * @param {Error|string} [options.error] - Error object or string (for failures).
 * @param {string} [options.stackTrace] - Stack trace (optional).
 * @param {string|number} [options.errorCode] - Internal error code (optional).
 * @param {boolean} [options.log=false] - Whether to log error or not.
 */
const resConv = ( 
  data = null,
  {
  message = '',
  code = 1,
  error = null,
  stackTrace,
  errorCode,
  log = false,
} = {}) => {
  const defaultMessages = {
    1: 'Success',
    0: 'Error',
    200: 'OK',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };

  const isError = code === 0 || (typeof code === 'number' && code >= 400);

  const responseMessage =
    message || (isError ? defaultMessages[code] || 'An error occurred' : '');

  // Extract error details if error is an object
  let errorDetails = null;
  let trace = stackTrace;

  if (isError && error) {
    if (error instanceof Error) {
      errorDetails = error.message;
      trace = trace || error.stack;
    } else if (typeof error === 'string') {
      errorDetails = error;
    } else if (typeof error === 'object') {
      errorDetails = JSON.stringify(error);
    }
  }

  if (isError && log) {
    logg.error(`[resConv] ${responseMessage}`, { error: errorDetails, trace });
  }

  const baseResponse = {
    status: code,
    message: responseMessage,
  };

  if (isError) {
    return {
      ...baseResponse,
      error: errorDetails,
      ...(trace ? { stackTrace: trace } : {}),
      ...(errorCode ? { errorCode } : {}),
    };
  }

  return {
    ...baseResponse,
    ...(data !== null ? { data } : {}),
  };
};

export default resConv;
