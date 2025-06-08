import Constants from "../config/constants.js";
import DateUtils from "../utils/DateUtils.js";
import {
    mObj,
    mongoOne,
    setArrayFilesAggregation as arrayFilesAggregation,
    setUserImage,
} from "../lib/mongoose.utils.js";
import { infoLog, logg, logger } from "../utils/logger.js";
import httpStatus from "http-status";
import EventService from "../services/EventService.js";
import { Redis } from "../services/RedisService.js";
import NotificationService from "../services/notification_service/NotificationService.js";
import ApiError from "../middlewares/ApiError.js";
import NotificationMessages from "../config/notificationMessages.js";
import QueryUtils from "../lib/QueryUtils.js";
import {
    NotificationCategory,
    NotificationSource,
    NotificationType,
} from "../config/NotificationEnums.js";
import { SupportTicket, TicketResponse } from "../models/support.model.js";
import { createDateId } from "../utils/Helper.utils.js";
import RedisKeys from "../lib/RedisKeys.js";

class SupportDBO {
    constructor() {
        EventService.on(Constants.EVENT.TICKET_UPDATE, ({ ticketId }) => {
            infoLog("SupportDBO Event:", "TICKET_UPDATE", ticketId);
            ticketId && this.purgeCache(ticketId);
        });
    }

    async fetchTickets({
        query = [],
        midQuery = [],
        project = {},
        timezone = Constants.TIME_ZONE_NAME,
        session = null,
        paginate = false,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = -1,
        sort,
    } = {}) {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "userObj",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "createdBy",
                        foreignField: "_id",
                        as: "createdByObj",
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "assignedTo",
                        foreignField: "_id",
                        as: "assignedToObj",
                    },
                },
                {
                    $lookup: {
                        from: "ticketresponses",
                        let: { id: "$_id" }, // Define the ticket ID from the current document
                        pipeline: [
                            { $match: { $expr: { $eq: ["$ticket", "$$id"] } } }, // ✅ Use $$id properly
                            { $sort: { createdAt: -1 } },
                            { $limit: 1 },
                        ],
                        as: "lastReply",
                    },
                },
                { $unwind: { path: "$userObj", preserveNullAndEmptyArrays: true } },
                {
                    $unwind: { path: "$createdByObj", preserveNullAndEmptyArrays: true },
                },
                {
                    $unwind: { path: "$assignedToObj", preserveNullAndEmptyArrays: true },
                },
                { $unwind: { path: "$lastReply", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                    },
                },
            ];
            logg("fetchTickets", JSON.stringify(pipeline, 2));

            pipeline.push(
                { $sort: sort || { [sortBy]: sortOrder } },
                { $skip: skip },
                { $limit: limit },
                setUserImage("userObj.image", "userImage"),
                setUserImage("createdByObj.image", "createdByImage"),
                setUserImage("assignedToObj.image", "assignedToImage"),

                {
                    $project: {
                        ticketId: 1,
                        user: {
                            _id: "$userObj._id",
                            name: "$userObj.name",
                            email: "$userObj.email",
                            image: "$userImage",
                            type: "$userObj.type",
                            role: "$userObj.role",
                        },
                        createdBy: {
                            _id: "$createdByObj._id",
                            name: "$createdByObj.name",
                            email: "$createdByObj.email",
                            image: "$createdByImage",
                            type: "$createdByObj.type",
                            role: "$createdByObj.role",
                        },
                        assignedTo: {
                            _id: "$assignedToObj._id",
                            name: "$assignedToObj.name",
                            email: "$assignedToObj.email",
                            image: "$assignedToImage",
                            type: "$assignedToObj.type",
                            role: "$assignedToObj.role",
                        },
                        lastReply: {
                            _id: "$lastReply._id",
                            message: "$lastReply.message",
                            createdAt: "$lastReply.createdAt",
                            user: "$lastReply.user",
                            type: "$lastReply.type",
                            isRead: "$lastReply.isRead",
                            attachments: arrayFilesAggregation("lastReply.attachments"),
                        },
                        subject: 1,
                        status: 1,
                        priority: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        createdAtText: 1,
                        updatedAtText: 1,
                        ...project,
                    },
                }
            );

            const tickets = await SupportTicket.aggregate(pipeline).session(session);
            if (!paginate) return tickets;

            const countFilter = query.length ? query[0].$match : {};
            const total = await SupportTicket.countDocuments(countFilter).session(
                session
            );

            return {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                tickets,
                timezone,
            };
        } catch (error) {
            console.error("fetchTickets Error:", error);
            throw error;
        }
    }

    async fetchReplies({
        query = [],
        midQuery = [],
        project = {},
        timezone = Constants.TIME_ZONE_NAME,
        session = null,
        paginate = false,
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        sortOrder = -1,
        sort,
    } = {}) {
        try {
            const skip = (page - 1) * limit;

            const pipeline = [
                ...query,
                ...midQuery,
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "userObj",
                    },
                },
                {
                    $lookup: {
                        from: "ticketresponses",
                        localField: "replyTo",
                        foreignField: "_id",
                        as: "replyToObj",
                    },
                },
                { $unwind: { path: "$userObj", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$replyToObj", preserveNullAndEmptyArrays: true } },
                {
                    $addFields: {
                        createdAtText: DateUtils.aggregate("$createdAt", { timezone }),
                        updatedAtText: DateUtils.aggregate("$updatedAt", { timezone }),
                    },
                },
            ];

            pipeline.push(
                { $sort: sort || { [sortBy]: sortOrder } },
                { $skip: skip },
                { $limit: limit },
                setUserImage("userObj.image", "userImage"),
                {
                    $project: {
                        user: {
                            _id: "$userObj._id",
                            name: "$userObj.name",
                            email: "$userObj.email",
                            image: "$userImage",
                            type: "$userObj.type",
                            role: "$userObj.role",
                        },
                        replyTo: {
                            _id: "$replyToObj._id",
                            user: "$replyToObj.user",
                            type: "$replyToObj.type",
                            isRead: "$replyToObj.isRead",
                            readAt: "$replyToObj.readAt",
                            message: "$replyToObj.message",
                            attachments: arrayFilesAggregation("replyToObj.attachments"),
                        },
                        replyTos: "$replyToObj._id",
                        ticket: 1,
                        message: 1,
                        isRead: 1,
                        readAt: 1,
                        type: 1,
                        attachments: arrayFilesAggregation("attachments"),
                        createdAt: 1,
                        updatedAt: 1,
                        createdAtText: 1,
                        updatedAtText: 1,
                        ...project,
                    },
                }
            );

            const tickets = await TicketResponse.aggregate(pipeline).session(session);
            if (!paginate) return tickets;

            const countFilter = query.length ? query[0].$match : {};
            const total = await TicketResponse.countDocuments(countFilter).session(
                session
            );

            return {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit),
                tickets,
                timezone,
            };
        } catch (error) {
            console.error("fetchTickets Error:", error);
            throw error;
        }
    }

    ticketList = async (data, { session = null } = {}) => {
        let { timezone, sort, midQuery, query, page } = QueryUtils.buildQuery(
            data,
            [],
            []
        );
        return await this.fetchTickets({
            query,
            midQuery,
            timezone,
            sort,
            page,
            session,
            paginate: true,
        });
    };

    userTickets = async (data, { session = null } = {}) => {
        let { timezone, sort, midQuery, query, page } = QueryUtils.buildQuery(
            data,
            [],
            []
        );
        return await this.fetchTickets({
            query,
            midQuery,
            timezone,
            sort,
            page,
            session,
            paginate: true,
        });
    };

    getById = async (id, { session = null, shouldForce = false } = {}) => {
        const redisData = await Redis.hget(...RedisKeys.TICKET_DETAILS(id));
        if (redisData && !shouldForce) {
            return redisData;
        } else {
            const obj = mongoOne(
                await this.fetchTickets({
                    query: [{ $match: { _id: mObj(id) } }],
                    session,
                })
            );
            if (obj) {
                Redis.hset(...RedisKeys.TICKET_DETAILS(id), obj);
                return obj;
            }
            return null;
        }
    };

    getReplyById = async (id, { session = null, shouldForce = false } = {}) => {
        const redisData = await Redis.hget(...RedisKeys.TICKET_REPLY_DETAILS(id));
        if (redisData && !shouldForce) {
            return redisData;
        } else {
            const obj = mongoOne(
                await this.fetchReplies({
                    query: [{ $match: { _id: mObj(id) } }],
                    session,
                })
            );
            if (obj) {
                Redis.hset(...RedisKeys.TICKET_REPLY_DETAILS(id), obj);
                return obj;
            }
            return null;
        }
    };

    create = async (data, { session }) => {
        const { user, subject, description, priority, createdBy, message } = data;
        let ticket = await SupportTicket.findOne({
            user,
            status: Constants.TICKET_STATUS.OPEN,
        }).session(session);
        if (ticket)
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                "An open ticket already exists."
            );
        const ticketId = createDateId("TICKET");
        ticket = new SupportTicket({
            ticketId,
            user,
            subject,
            description,
            priority: priority || Constants.TICKET_PRIORITY.MEDIUM,
            status: Constants.TICKET_STATUS.OPEN,
            createdBy,
        });
        ticket = await ticket.save({ session, new: true });
        if (message)
            await this.reply(
                { ticket: ticket._id, user, message },
                { session, notify: false }
            );
        EventService.emit(Constants.EVENT.TICKET_UPDATE, { ticketId: ticket._id });
        return await this.getById(ticket._id, { session });
    };

    update = async (data, { session }) => {
        const { id, status, priority, subject, assignedTo } = data;
        const ticket = await SupportTicket.findById(mObj(id)).session(session);
        const sendNotification =
            (status && status !== ticket.status) ||
            (priority && priority !== ticket.priority);
        if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (subject) ticket.subject = subject;
        if (assignedTo) ticket.assignedTo = assignedTo;
        await ticket.save({ session, new: true });
        EventService.emit(Constants.EVENT.TICKET_UPDATE, { ticketId: id });
        if (sendNotification) {
            this.sendTicketNotification(id, {
                user: ticket.user,
                title: NotificationMessages.TICKET.TICKET_UPDATED.title,
                message: NotificationMessages.TICKET.TICKET_UPDATED.message,
                code: "TICKET_UPDATED",
                data: { ticket: ticket._id },
            });
        }
        return await this.getById(mObj(id), { session });
    };

    purgeCache = async (ticketId) => {
        if (!ticketId) return;
        await Redis.hdel(...RedisKeys.TICKET_DETAILS(ticketId));
    };

    sendTicketNotification = async (ticketId, payload) => {
        if (!ticketId) {
            logger.warn(
                "SupportDBO -> sendTicketNotification -> Invalid Ticket ID:",
                ticketId
            );
            return null;
        }
        const notificationData = {
            user: payload.user,
            source: payload.source || NotificationSource.SUPPORT_SYSTEM,
            category: payload.category || NotificationCategory.SUPPORT,
            type: payload.type || NotificationType.SUPPORT,
            title: payload.title,
            message: payload.message,
            code: payload.code,
            data: payload.data,
            priority: payload.priority || Constants.TICKET_PRIORITY.NORMAL,
        };
        return await NotificationService.sendNotificationToUser(notificationData);
    };

    reply = async (data, { session, notify = true }) => {
        const { ticket, user, message, attachments, replyTo } = data;
        let ticketObj = await TicketResponse({
            ticket,
            replyTo,
            user,
            message,
            attachments,
        });
        ticketObj = await ticketObj.save({ session, new: true });
        EventService.emit(Constants.EVENT.TICKET_UPDATE, { ticketId: ticket });
        return await this.getReplyById(ticketObj._id, { session });
    };

    getReplies = async (id, data = {}, { session = null } = {}) => {
        let { timezone, sort, midQuery, query, page } = QueryUtils.buildQuery(
            data,
            [],
            []
        );
        query.push({ $match: { ticket: mObj(id) } });
        return await this.fetchReplies({
            query,
            midQuery,
            timezone,
            sort,
            page,
            session,
            paginate: true,
        });
    };

    replyDetail = async (id, { session = null } = {}) => {
        return await this.getReplyById(mObj(id), { session });
    };

    markAsRead = async (id, { session = null }) => {
        let reply = await TicketResponse.findById(mObj(id)).session(session);
        if (!reply) throw new ApiError(httpStatus.NOT_FOUND, "Reply not found");
        if (reply.isRead) return reply;
        reply.isRead = true;
        reply.readAt = new Date();
        reply = await reply.save({ session });
        return await this.getReplyById(reply._id, { session });
    };
}

export default new SupportDBO();
