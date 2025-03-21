import Constants from '../../config/constants.js';

import Joi from "joi";
import { logg } from '../../utils/logger.js';

export const emailValidator = Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
        "string.email": "Invalid email address",
    });

export const customCountryPhoneValidator = Joi.string()
    .custom((value, helpers) => {
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

export const phoneValidator = Joi.string()
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

export const commonPaginationSchema = {
    index: Joi.number().optional().default(1),
    row: Joi.string().optional().default("createdAt"),
    order: Joi.string().valid("asc", "desc").optional().default("desc"),
    query: Joi.string().optional().allow("", null),
    query_data: Joi.array().items(Joi.object()).optional(),
};