import Joi from "joi";
import Constants from "../../config/constants.js";


const webPageSchema = (isRequired = false) => ({
    title: isRequired ? Joi.string().min(3).max(255).required() : Joi.string().min(3).max(255).optional(),
    slug: isRequired ? Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required() : Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    content: isRequired ? Joi.string().required() : Joi.string().optional().allow("", null),
    status: Joi.string().valid(...Object.values(Constants.pageStatus)).default(Constants.pageStatus.DRAFT),
    metaTitle: Joi.string().max(255).allow("", null),
    metaDescription: Joi.string().max(500).allow("", null),
    keywords: Joi.array().items(Joi.string().max(50)).optional(),
    createdBy: Joi.string().optional(),
    updatedBy: Joi.string().optional(),
});

export const createWebPage = {
    body: {
        ...webPageSchema(true),
    },
};

export const updateWebPage = {
    body: {
        ...webPageSchema(),
        id: Joi.string().required(),
    },
};

export const getWebPageBySlug = {
    params: {
        slug: Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required(),
    },
};

export const deleteWebPage = {
    params: {
        id: Joi.string().required(),
    },
};
