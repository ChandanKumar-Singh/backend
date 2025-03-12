import Joi from 'joi';
import Constants from '../../config/constants.js';

export const create = {
    body: {
        deviceId: Joi.string().required(),
        fingerprint: Joi.string().optional(),
        deviceType: Joi.string().valid(...Object.values(Constants.Device.deviceType)).required(),
        os: Joi.string().valid(...Object.values(Constants.Device.os)).required(),
        osVersion: Joi.string().required(),
        appVersion: Joi.string().optional(),
        screenSize: Joi.string().optional(),
        ipAddress: Joi.string().optional(),
        location: Joi.object().keys({
            lat: Joi.number().required(),
            lon: Joi.number().required()
        }).optional(),
        isActive: Joi.boolean().default(true),
        lastActiveAt: Joi.date().default(Date.now),
        fcmToken: Joi.string().required()
    }
}

export const byUserId = {
    params: {
        userId: Joi.string().required()
    }
}