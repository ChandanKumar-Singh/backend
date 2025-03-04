const resConv = ( data = null, message = '', code = 1, stackTrace ) => {
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
    ? { status: code, message: responseMessage, error: data, stackTrace }
    : { status: code, message: responseMessage, data, stackTrace };
};

export default resConv;
