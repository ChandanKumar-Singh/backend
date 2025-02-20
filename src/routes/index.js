import { Router } from "express";
import Constants from "../config/constants.js";
import viewRoutes from "./views/index.js";

const routes = new Router();

routes.use(Constants.routes.view, viewRoutes)


export default routes; 