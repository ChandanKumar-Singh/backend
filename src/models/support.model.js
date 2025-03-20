import mongoose from "mongoose";
import Constants from "../config/constants.js";

const { TICKET_STATUS, TICKET_PRIORITY } = Constants;
const supportTicketSchema = new mongoose.Schema(
    {
        ticketId: { type: String, unique: true, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        subject: { type: String, required: true, trim: true },
        status: { type: String, enum: Object.values(TICKET_STATUS), default: TICKET_STATUS.OPEN },
        priority: { type: String, enum: Object.values(TICKET_PRIORITY), default: TICKET_PRIORITY.MEDIUM },
    },
    { timestamps: true }
);

const ticketResponseSchema = new mongoose.Schema(
    {
        ticket: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "TicketResponse", default: null },
        type: { type: String, enum: Object.values(Constants.MessageType), default: Constants.MessageType.TEXT, required: true },
        message: { type: String },
        isRead: { type: Boolean, default: false },
        readAt: { type: Date, default: null },
        attachments: [{ type: String }],
    },
    { timestamps: true }
);

export const TicketResponse = mongoose.model("TicketResponse", ticketResponseSchema);
export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
