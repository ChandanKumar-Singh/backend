import Joi from "joi";
import Constants from "../../config/constants.js";
import { commonPaginationSchema } from "./common_schemas.js";
import { isMongoId } from "../../lib/mongoose.utils.js";

const { TICKET_STATUS, TICKET_PRIORITY } = Constants;

class TicketValidation {
    static create = {
        body: {
            user: Joi.string().required().messages({
                "any.required": "User ID is required.",
            }),
            createdBy: Joi.string().required().messages({
                "any.required": "CreatedBy ID is required.",
            }),
            assignedTo: Joi.string().optional().allow(null),
            subject: Joi.string().trim().required().messages({
                "any.required": "Subject is required.",
            }),
            message: Joi.string().trim().optional(),
            priority: Joi.string()
                .valid(...Object.values(TICKET_PRIORITY))
                .default(TICKET_PRIORITY.MEDIUM)
                .messages({
                    "any.only": `Priority must be one of: ${Object.values(TICKET_PRIORITY).join(", ")}`,
                }),
        },
    };

    static update = {
        body: {
            id: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
            status: Joi.string()
                .valid(...Object.values(TICKET_STATUS))
                .optional()
                .messages({
                    "any.only": `Status must be one of: ${Object.values(TICKET_STATUS).join(", ")}`,
                }),
            priority: Joi.string()
                .valid(...Object.values(TICKET_PRIORITY))
                .optional()
                .messages({
                    "any.only": `Priority must be one of: ${Object.values(TICKET_PRIORITY).join(", ")}`,
                }),
            assignedTo: Joi.string().optional().allow(null),
        },
    };

    static replyToSchema = Joi.string()
        .optional()
        .allow(null)
        .custom((value, helpers) => {
            if (!value) return value;
            if (isMongoId(value)) return value;
            return helpers.error("string.invalid", { value });
        })
        .messages({
            "string.invalid": "Invalid replyTo ID format.",
        });

    static reply = {
        body: {
            ticket: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
            attachments: Joi.array().max(5).items(Joi.string()).empty().allow(null),
            message: Joi.alternatives().conditional("attachments", {
                is: Joi.array().min(1),
                then: Joi.string().allow("").optional(),
                otherwise: Joi.string().required().messages({
                    "any.required": "Either message or attachments is required.",
                    "string.empty": "Either message or attachments is required.",
                }),
            }),
            replyTo: TicketValidation.replyToSchema,
            isRead: Joi.boolean().optional(),
            readAt: Joi.date().optional().allow(null),
        },
    };

    static replies = {
        params: {
            ticket: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
            ...commonPaginationSchema,
        },
    };

    static replyDetail = {
        params: {
            id: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
        },
    };

    static getTicketDetails = {
        params: {
            id: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
        },
    };

    static getUserTickets = {
        body: {
            ...commonPaginationSchema,
        },
    };

    static assignTicket = {
        params: {
            id: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
            assignedTo: Joi.string().required().messages({
                "any.required": "AssignedTo ID is required.",
            }),
        },
    };

    static markAsRead = {
        params: {
            id: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
        },
    };

    static deleteTicket = {
        params: {
            id: Joi.string().required().messages({
                "any.required": "Ticket ID is required.",
            }),
        },
    };
}

export default TicketValidation;
