import { Router } from "express";
import Constants from "../config/constants.js";
import viewRoutes from "./views/index.js";
import apiRoutes from "./apis/index.js";
const router = new Router();
console.log(`Apis route at ${Constants.routes.api}`)
router.use(Constants.routes.view, viewRoutes)
router.use(Constants.routes.api, apiRoutes)


export default router; 