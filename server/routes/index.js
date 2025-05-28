import { Router } from "express";
import Constants from "../config/constants.js";
import viewRoutes from "./views/index.js";
import apiRoutes from "./apis/index.js";
const routes = new Router();

routes.use(Constants.routes.view, viewRoutes)
routes.use(Constants.routes.api, apiRoutes)


export default routes; 