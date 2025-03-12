/**
 * Created by Dev on 28 Dec 2024.
 */
export default {
  // Success Codes
  SUCCESS: 'SUCCESS',

  // Error Codes
  ERROR: {
    PARAMETERS_MISSING: (param) => `Parameters missing: ${param}`,
    SERVER_ERROR: 'SERVER_ERROR',
    INVALID_TOKEN: 'Authentication Failed',
    STORE_GEO_FENCE_NOT_FOUND: 'No Store Found In Current Location',
    RESOURCE_NOT_FOUND: (resource) => `Requested resource "${resource}" not found.`,
    UNEXPECTED_ERROR: 'An unexpected error occurred, please try again later.',
    INVALID_REQUEST: 'Invalid request parameters.',
    ACCESS_DENIED: 'Access Denied',
    TIMEOUT: 'Request timed out. Please try again later.',
    VALIDATION_FAILED: 'Validation Failed',
    USER_NOT_FOUND: (userId) => `User with ID ${userId} not found.`,
    UNAUTHORIZED_ACCESS: 'Unauthorized Access',
    FORBIDDEN: 'Forbidden action.',
    DATABASE_CONNECTION_FAILED: 'Database connection failed.',
    NOT_FOUND: 'Not found.',
  },

  // Authentication Errors
  AUTH_ERRORS: {
    INVALID_CREDENTIALS: 'Invalid credentials.',
    EXPIRED_TOKEN: 'Session expired',
    UNAUTHORIZED_ACCESS: 'Unauthorized Access',
    ACCOUNT_LOCKED: 'Account is locked.',
    PASSWORD_INCORRECT: 'Incorrect password.',
    TOKEN_NOT_FOUND: 'Token not found.',
    INVALID_TOKEN: 'Invalid token.',
    ACCOUNT_NOT_VERIFIED: 'Account not verified.',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    ACCOUNT_CREATED: 'Account created successfully.',
    DATA_SAVED: 'Data saved successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
    EMAIL_SENT: 'Email has been sent successfully to ${email}.',
    OPERATION_SUCCESS: 'Operation completed successfully.',
    RESOURCE_CREATED: 'Resource created successfully.',
  },

  // Informational Messages
  INFO_MESSAGES: {
    WELCOME: 'Welcome to the platform, ${username}!',
    LOGOUT_SUCCESS: 'Logged out successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    EMAIL_VERIFIED: 'Email verified successfully.',
    PASSWORD_RESET: 'Password reset successfully.',
  },

  // System and Server Errors
  SYSTEM_ERRORS: {
    DATABASE_ERROR: 'Database error.',
    SERVER_UNAVAILABLE: 'Server is temporarily unavailable.',
    MAINTENANCE_MODE: 'The system is under maintenance. Please try again later.',
    NETWORK_ERROR: 'Network error, please check your internet connection.',
  },

  // User-related Errors
  USER_ERRORS: {
    USER_ALREADY_EXISTS: (data) => `User with ${data} already exists.`,
    EMAIL_ALREADY_REGISTERED: (email) => `Email ${email} is already registered.`,
    INVALID_USER_INPUT: 'Invalid user input.',
    USER_ACCOUNT_INACTIVE: 'User account is inactive. Please contact support.',
  },

  // Payment and Billing Errors
  PAYMENT_ERRORS: {
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    INSUFFICIENT_BALANCE: 'Insufficient balance for the transaction.',
    PAYMENT_TIMEOUT: 'Payment request timed out.',
    INVALID_CARD_DETAILS: 'Invalid card details.',
  },

  // Validation Errors
  VALIDATION_ERRORS: {
    FIELD_REQUIRED: (field) => `${field} is required.`,
    INVALID_EMAIL_FORMAT: 'Invalid email format.',
    PASSWORD_TOO_SHORT: 'Password is too short, minimum length is 8 characters.',
    INVALID_PHONE_NUMBER: 'Invalid phone number format.',
  },

  // Notifications
  NOTIFICATIONS: {
    EMAIL_CONFIRMATION: 'Please confirm your email address.',
    PHONE_VERIFICATION: 'Please verify your phone number.',
    TWO_FACTOR_AUTH: 'Two-factor authentication required.',
    PASSWORD_EXPIRED: 'Your password has expired. Please reset it.',
    ACCOUNT_SUSPENDED: 'Your account has been suspended. Please contact support.',
  },
};
