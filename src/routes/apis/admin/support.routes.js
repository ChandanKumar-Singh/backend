import express from "express";
import { AdminMiddleware } from "../../../middlewares/authenticate.js";
import SchemaValidator from "../../../middlewares/SchemaValidator.js";
import SupportScheme from "../../../middlewares/validators/support.validator.js";
import SupportController from "../../../controllers/SupportController.js";

const router = express.Router();

router.post("/create", AdminMiddleware, SchemaValidator(SupportScheme.create), SupportController.createTicket);
router.post("/tickets", AdminMiddleware, SchemaValidator(SupportScheme.getUserTickets), SupportController.getUserTickets);
// router.get("/", AdminMiddleware, SchemaValidator(SupportScheme.getUserTickets), SupportController.getUserTickets);
router.get("/:id", AdminMiddleware, SchemaValidator(SupportScheme.getTicketDetails), SupportController.getTicketDetail);
router.put("/:id/update", AdminMiddleware, SchemaValidator(SupportScheme.update), SupportController.updateTicket);
router.put("/:id/assign/:assignedTo", AdminMiddleware, SchemaValidator(SupportScheme.assignTicket), SupportController.assignTicket);
router.post("/:ticket/reply", AdminMiddleware, SupportController.uploadImage, SchemaValidator(SupportScheme.reply), SupportController.reply);
router.post("/:ticket/replies", AdminMiddleware, SchemaValidator(SupportScheme.replies), SupportController.getReplies);
router.get("/reply/:id", AdminMiddleware, SchemaValidator(SupportScheme.replyDetail), SupportController.replyDetail);
router.get("/reply/:id/mark-read", AdminMiddleware, SchemaValidator(SupportScheme.markAsRead), SupportController.markAsRead);
router.delete("/:id", AdminMiddleware, SchemaValidator(SupportScheme.deleteTicket), SupportController.deleteTicket);

export default router;

