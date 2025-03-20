import express from "express";
import { UserMiddleware } from "../../../middlewares/authenticate.js";
import SchemaValidator from "../../../middlewares/SchemaValidator.js";
import SupportScheme from "../../../middlewares/validators/support.validator.js";
import SupportController from "../../../controllers/SupportController.js";

const router = express.Router();

router.post("/create", UserMiddleware, SchemaValidator(SupportScheme.create), SupportController.createTicket);
router.post("/tickets", UserMiddleware, SchemaValidator(SupportScheme.getUserTickets), SupportController.getUserTickets);
// router.get("/", UserMiddleware, SchemaValidator(SupportScheme.getUserTickets), SupportController.getUserTickets);
router.get("/:id", UserMiddleware, SchemaValidator(SupportScheme.getTicketDetails), SupportController.getTicketDetail);
router.put("/:id/update", UserMiddleware, SchemaValidator(SupportScheme.update), SupportController.updateTicket);
router.put("/:id/assign/:assignedTo", UserMiddleware, SchemaValidator(SupportScheme.assignTicket), SupportController.assignTicket);
router.post("/:ticket/reply", UserMiddleware, SupportController.uploadImage, SchemaValidator(SupportScheme.reply), SupportController.reply);
router.post("/:ticket/replies", UserMiddleware, SchemaValidator(SupportScheme.replies), SupportController.getReplies);
router.get("/reply/:id", UserMiddleware, SchemaValidator(SupportScheme.replyDetail), SupportController.replyDetail);
router.get("/reply/:id/mark-read", UserMiddleware, SchemaValidator(SupportScheme.markAsRead), SupportController.markAsRead);
router.delete("/:id", UserMiddleware, SchemaValidator(SupportScheme.deleteTicket), SupportController.deleteTicket);

export default router;

