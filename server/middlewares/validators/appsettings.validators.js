import Joi from "joi";
import { customCountryPhoneValidator, emailValidator, phoneValidator } from "./common.validators.js";


const general = Joi.object({
    name: Joi.string().default('New Project'),
    description: Joi.string(),
    logo: Joi.string(),
    favicon: Joi.string(),
    primaryColor: Joi.string().allow('', null),
    secondaryColor: Joi.string().allow('', null),
    tertiaryColor: Joi.string().allow('', null),
})

const contact = Joi.object({
    email: emailValidator.allow('', null),
    phone: customCountryPhoneValidator.allow('', null),
    address: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    country: Joi.string().allow('', null),
    zip: Joi.string().allow('', null),
})

const social = Joi.object({
    facebook: Joi.string().allow('', null),
    twitter: Joi.string().allow('', null),
    instagram: Joi.string().allow('', null),
    linkedin: Joi.string().allow('', null),
    youtube: Joi.string().allow('', null),
})

const seo = Joi.object({
    title: Joi.string().allow('', null),
    description: Joi.string().allow('', null),
    keywords: Joi.array().items(Joi.string().allow('', null)),
})

const analytics = Joi.object({
    google: Joi.string().allow('', null),
    facebook: Joi.string().allow('', null),
    twitter: Joi.string().allow('', null),
    linkedin: Joi.string().allow('', null),
})

const credentials_email = Joi.object({
    host: Joi.string().allow('', null),
    port: Joi.string().allow('', null),
    secure: Joi.boolean().default(false),
    user: Joi.string().allow('', null),
    pass: Joi.string().allow('', null),
})

const credentials_sms = Joi.object({
    apiKey: Joi.string().allow('', null),
    senderId: Joi.string().allow('', null),
})

const credentials_push = Joi.object({
    apiKey: Joi.string().allow('', null),
    senderId: Joi.string().allow('', null),
})

const credentials = Joi.object({
    credentials_email,
    credentials_sms,
    credentials_push,
})

const security = Joi.object({
    sessionTimeout: Joi.number().default(30), // in minutes
    maxLoginAttempts: Joi.number().default(5),
    lockoutDuration: Joi.number().default(15), // in minutes
    allowedIPs: Joi.array().items(Joi.string()),
    blockedIPs: Joi.array().items(Joi.string()),
})

const settings = Joi.object({
    timezone: Joi.string().default('Asia/Kolkata'),
    currency: Joi.string().default('INR'),
    language: Joi.string().default('en'),
})

const apiLimits = Joi.object({
    maxRetry: Joi.number().default(5000),
    sessionCount: Joi.number().default(3),
})

const version = Joi.object({
    version: Joi.string().required(),
    build: Joi.string().required(''),
    forceUpdate: Joi.boolean().default(false),
    updateMessage: Joi.string().allow('', null),
    url: Joi.string().uri().allow('', null).message('Invalid URL'),
    log: Joi.string().allow('', null),
})

const app_version = Joi.object({
    ios: version,
    android: version,
}).or('ios', 'android')


export const update = {
    body: {
        area: Joi.string()
            .valid(
                'general', 'contact', 'social', 'seo', 'analytics', 'credentials_email', 'credentials_sms', 'credentials_push',
                'security', 'settings', 'apiLimits', 'app_version'
            )
            .required(),
        settings: Joi.object({
            general,
            contact,
            social,
            seo,
            analytics,
            credentials_email,
            credentials_sms,
            credentials_push,
            security,
            settings,
            apiLimits,
            app_version,
        }).or('general', 'contact', 'social', 'seo', 'analytics', 'credentials_email', 'credentials_sms', 'credentials_push', 'security', 'settings', 'apiLimits', 'app_version').required(),
    }
}




