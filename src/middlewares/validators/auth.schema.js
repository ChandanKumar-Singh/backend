import Constants from '../../config/constants.js';

import Joi from "joi";
import { logg } from '../../utils/logger.js';

const emailValidator = Joi.string()
  .email({ tlds: { allow: false } })
  .messages({
    "string.email": "Invalid email address",
  });

const customCountryPhoneValidator = Joi.string()
  .custom((value, helpers) => {
    // Split input into parts (country code + phone number)
    const parts = value.split(" ");
    if (parts.length < 2) {
      return helpers.error("missingCode");
    }

    const countryCode = parts[0]; // Extract country code
    const phoneNumber = parts.slice(1).join(" "); // Extract phone number

    // Country code validation
    const codePattern = /^\+\d{1,3}$/;
    if (!codePattern.test(countryCode)) {
      return helpers.error("invalidCode");
    }

    // Full phone number validation
    const phonePattern = /^\d{6,14}$/; // Only numbers after the country code
    if (!phonePattern.test(phoneNumber)) {
      return helpers.error("invalidFormat");
    }

    return value;
  })
  .messages({
    "missingCode": "Missing country code (e.g., +91 9876543211)",
    "invalidCode": "Invalid country code format (e.g., +1, +91, +44)",
    "invalidFormat": "Invalid phone format. Must be a valid number (e.g., +1 123456789)",
  });

const phoneValidator = Joi.string()
  .custom((value, helpers) => {
    const phonePattern = /^\d{6,14}$/;
    if (!phonePattern.test(value)) {
      return helpers.error("invalidFormat");
    }

    return value;
  })
  .messages({
    "invalidFormat": "Invalid phone format. Must be a valid number (e.g., 123456789)",
  });

export const login = {
  body: {
    username: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        // Check if the input is an email
        if (value.includes("@")) {
          const { error } = emailValidator.validate(value);
          if (error) return helpers.error("username.email");
          return value;
        }

        // Validate phone number (with country code)
        const { error: phoneError } = phoneValidator.validate(value);
        if (phoneError) return helpers.message(phoneError.details[0].message);

        return value;
      })
      .messages({
        "any.required": "Username field is required",
        "username.email": "Invalid email address",
      }),

    password: Joi.string()
      .when("username", {
        is: emailValidator,
        then: Joi.string().required().messages({
          "any.required": "Password is required when logging in with an email",
        }),
      })
      .messages({
        "string.empty": "Password cannot be empty",
      }),
  },
};






export const loginSchema = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  },
};




export const create = {
  body: {
    country_code: Joi.string().required().default('+91'),
    contact: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    role: Joi.string()
      .valid(...Object.values(Constants.roles.adminRole)) // Use spread operator
      .required()
      .messages({
        'any.only': `Role must be one of: ${Object.values(Constants.roles.adminRole).join(', ')}.`,
      }),
    type: Joi.string()
      .valid(...Object.values(Constants.roles.userRoles)) // Use spread operator
      .required()
      .messages({
        'any.only': `Type must be one of: ${Object.values(Constants.roles.userRoles).join(', ')}.`,
      }),
  }
};

export const sendOTP = {
  body: {
    contact: Joi.string().required()
  }
};

export const verifyOTP = {
  body: {
    contact: Joi.string().required(),
    otp: Joi.string().required(),
  }
};


export const completeProfile = {
  body: {
    password: Joi.string().required(),
    email: Joi.string().required(),
    image: Joi.string().optional().allow('', null),
  }
}

export const versionCheck = {
  body: {
    device_os: Joi.string().required(),
    os_version: Joi.string().optional().allow('', null),
    app_version: Joi.number().required(),
  }
};

export const captureInfo = {
  body: {
    gcm_id: Joi.string().required(),
    device_id: Joi.string().optional().allow('', null),
    device_os: Joi.string().optional().allow('', null),
    os_version: Joi.string().optional().allow('', null),
    app_version: Joi.string().optional().allow('', null),
  }
};
