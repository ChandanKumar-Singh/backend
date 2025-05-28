import httpStatus from 'http-status';
import catchAsync from '../lib/catchAsync.js';
import ApiError from '../middlewares/ApiError.js';
import { withTransaction } from '../lib/mongoose.utils.js';
import resConv from '../utils/resConv.js';
import SupportDBO from '../dbos/SupportDBO.js';
import { logg } from '../utils/logger.js';
import FileUploadUtils from '../utils/FileUpload.utils.js';
import Constants from '../config/constants.js';

class SupportController {
    uploadImage = catchAsync(async (req, res, next) => {
        const tempUpload = await FileUploadUtils.uploadFiles(
            req,
            res,
            [{ name: 'attachments', maxCount: 5 }],
            Constants.paths.DEFAULT_SUPPORT_IMAGE_PATH
        );
        let attachments = null;
        if (tempUpload.files && 'attachments' in tempUpload.files && tempUpload.files.attachments.length > 0) {
            attachments = [];
            for (let i = 0; i < tempUpload.files.attachments.length; i++) {
                attachments.push(Constants.paths.DEFAULT_SUPPORT_IMAGE_PATH + tempUpload.files.attachments[i].filename);
            }
        }

        req.body = {
            ...req.body,
            ...tempUpload.body,
            attachments,
        };
        next();
    });
    createTicket = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const ticket = await SupportDBO.create(req.body, { session });
        res.status(httpStatus.CREATED).json(resConv(ticket, 'Ticket created successfully'));
    }));

    getUserTickets = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const tickets = await SupportDBO.userTickets(req.body, { session });
        res.status(httpStatus.OK).json(resConv(tickets));
    }));

    getTicketDetail = catchAsync(async (req, res) => {
        const ticket = await SupportDBO.getById(req.body.id);
        if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, 'Ticket not found');
        res.status(httpStatus.OK).json(resConv(ticket));
    });

    reply = catchAsync(async (req, res) => await withTransaction(async (session) => {
        let data = req.body;
        data.user = req.user.id;
        const updatedTicket = await SupportDBO.reply(data, { session });
        res.status(httpStatus.OK).json(resConv(updatedTicket, 'Reply added successfully'));
    }));

    getReplies = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const replies = await SupportDBO.getReplies(req.body.ticket, req.body, { session });
        res.status(httpStatus.OK).json(resConv(replies));
    }));

    replyDetail = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const replies = await SupportDBO.replyDetail(req.body.id, { session });
        res.status(httpStatus.OK).json(resConv(replies));
    }));

    updateTicket = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const updatedTicket = await SupportDBO.update(req.body, { session });
        res.status(httpStatus.OK).json(resConv(updatedTicket, 'Ticket updated successfully'));
    }));

    assignTicket = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const updatedTicket = await SupportDBO.update(req.body, { session });
        res.status(httpStatus.OK).json(resConv(updatedTicket, `Ticket assigned to ${updatedTicket?.assignedTo?.name}`));
    }));

    markAsRead = catchAsync(async (req, res) => await withTransaction(async (session) => {
        const updatedTicket = await SupportDBO.markAsRead(req.body.id, { session });
        res.status(httpStatus.OK).json(resConv(updatedTicket, 'Marked as read'));
    }));

    deleteTicket = catchAsync(async (req, res) => await withTransaction(async (session) => {
        let res = await SupportDBO.delete(req.params.ticketId, { session });
        res.status(httpStatus.NO_CONTENT).send(resConv(res), 'Ticket deleted successfully');
    }));
}

export default new SupportController();
