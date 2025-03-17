import { Router } from 'express';
import adminRoutes from './admin/index.js'
import userRoutes from './user/index.js'
import Constants from '../../config/constants.js';
const routes = Router();

routes.use(Constants.routes.admin, adminRoutes);
routes.use('/', userRoutes);

export default routes;
