import Joi from 'joi';

const crudSchema = (isRequired = false) => {
    return {
        name: isRequired ? Joi.string().required() : Joi.string().optional().allow('', null),
        member_id: Joi.string().optional().allow('', null),
        contact: Joi.string().optional().allow('', null),
        email: Joi.string().optional().allow('', null),
        type: isRequired ? Joi.string().required() : Joi.string().optional().allow('', null),
        image: Joi.string().optional().allow('', null),
        status: Joi.string().optional().allow('', null),
        role: Joi.string().optional().allow('', null),
        country_code: Joi.string().optional().allow('', null),
    };
};

export const create = {
    body: {
        ...crudSchema(true),
        password: Joi.string().required(),
    },
};

export const update = {
    body: {
        ...crudSchema(),
        id: Joi.string().required(),
    },
};

export const detail = {
    body: {
        id: Joi.string().required(),
    },
};

export const isExists = {
    body: {
        id: Joi.string().optional().allow('', null),
        contact: Joi.string().optional().allow('', null),
        email: Joi.string().optional().allow('', null),
        type: Joi.string().optional().allow('', null),
    },
};
