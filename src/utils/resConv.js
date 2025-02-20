const resConv = ( data = {}, code = 1, message = '' ) => {
  // Default messages for common status codes
  const defaultMessages = {
    1: 'Success',
    0: 'Error',
    200: 'OK',
    400: 'Bad Request',
    401: 'You are not authorized.',
    404: 'Not Found',
    500: 'Internal Server Error',
  };

  // If no message is provided, use the default message based on the code
  if (!message) {
    message = defaultMessages[code] || 'Failed';
  }

  return {
    status: code,          // Status code (success, error, etc.)
    message: message,      // Message (custom or default based on code)
    data: data,            // Data returned by the API
  };
};

export default resConv;
