import { Router } from 'express';
import adminRoutes from './admin/index.js'
import Constants from '../../config/constants.js';
const routes = Router();

routes.use(Constants.routes.admin, adminRoutes);

export default routes;
