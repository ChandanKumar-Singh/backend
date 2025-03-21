import Constants from '../../config/constants.js';

import Joi from "joi";
import { logg } from '../../utils/logger.js';
import { emailValidator, phoneValidator } from './common.validators.js';



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
          "any.required": "Password is required.",
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
      .valid(...Object.values(Constants.roles.role))
      .required()
      .messages({
        'any.only': `Role must be one of: ${Object.values(Constants.roles.role).join(', ')}.`,
      }),
    type: Joi.string()
      .valid(...Object.values(Constants.roles.accessLevels).filter((i) => i !== Constants.roles.accessLevels.ADMIN))
      .required()
      .messages({
        'any.only': `Type must be one of: ${Object.values(Constants.roles.accessLevels).filter((i) => i !== Constants.roles.accessLevels.ADMIN).join(', ')}.`,
      }),
  }
};

export const adminCreate = {
  body: {
    country_code: Joi.string().required().default('+91'),
    contact: Joi.string().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    role: Joi.string()
      .valid(...Object.values(Constants.roles.adminRole))
      .required()
      .messages({
        'any.only': `Role must be one of: ${Object.values(Constants.roles.adminRole).join(', ')}.`,
      }),
    type: Joi.string()
      .valid(...Object.values(Constants.roles.accessLevels))
      .required()
      .messages({
        'any.only': `Type must be one of: ${Object.values(Constants.roles.accessLevels).join(', ')}.`,
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
    username: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        // Check if the input is an email
        if (value.includes("@")) {
          const { error } = emailValidator.validate(value);
          if (error) return helpers.error("email");
          return value;
        }
        // Validate phone number (with country code)
        const { error: phoneError } = phoneValidator.validate(value);
        if (phoneError) return helpers.message(phoneError.details[0].message);
        return value;
      })
      .messages({
        "any.required": "Username field is required",
        "email": "Invalid email address",
      }),
    otp: Joi.string().required().length(6).messages({
      "string.length": "OTP must be 6 characters long",
    }),
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

export const forgotPassword = {
  body: {
    username: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        // Check if the input is an email
        if (value.includes("@")) {
          const { error } = emailValidator.validate(value);
          if (error) return helpers.error("email");
          return value;
        }
        // Validate phone number (with country code)
        const { error: phoneError } = phoneValidator.validate(value);
        if (phoneError) return helpers.message(phoneError.details[0].message);
        return value;
      })
      .messages({
        "any.required": "Username field is required",
        "email": "Invalid email address",
      }),
  }
}

export const resetPassword = {
  body: {
    username: Joi.string()
      .trim()
      .required()
      .custom((value, helpers) => {
        // Check if the input is an email
        if (value.includes("@")) {
          const { error } = emailValidator.validate(value);
          if (error) return helpers.error("email");
          return value;
        }
        // Validate phone number (with country code)
        const { error: phoneError } = phoneValidator.validate(value);
        if (phoneError) return helpers.message(phoneError.details[0].message);
        return value;
      })
      .messages({
        "any.required": "Username field is required",
        "email": "Invalid email address",
      }),
    password: Joi.string().required(),
    confirm_password: Joi.string().required().valid(Joi.ref('password')).messages({
      'any.only': 'Passwords do not match',
    }),
    otp: Joi.string().required().length(6).messages({
      "string.length": "OTP must be 6 characters long",
    }),

  }
}
