import Joi from 'joi';
import Constants from '../../config/constants.js';

export const login = {
  body: {
    contact: Joi.string().required(),
    password: Joi.string().required(),
  }
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
