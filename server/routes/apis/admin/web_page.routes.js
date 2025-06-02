
import express from "express";
import PageController from "../../../controllers/admin/pageController.js";
import * as WebSchema from "../../../middlewares/validators/page.validators.js";
import { AdminMiddleware } from "../../../middlewares/authenticate.js";
import SchemaValidator from "../../../middlewares/SchemaValidator.js";

const router = express.Router();

router.get("/list", AdminMiddleware, PageController.list);
router.post("/create", AdminMiddleware, SchemaValidator(WebSchema.createWebPage), PageController.create);
// router.get("/:id", AdminMiddleware, PageController.getAllPages);
// router.get("/:slug", PageController.getPageBySlug);
router.post("/update/:id", AdminMiddleware, SchemaValidator(WebSchema.updateWebPage), PageController.updateWebPage);
router.delete("/delete/:id", AdminMiddleware, SchemaValidator(WebSchema.deleteWebPage), PageController.delete);

export default router;
