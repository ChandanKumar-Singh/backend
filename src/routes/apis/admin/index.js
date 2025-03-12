import { Router } from 'express';
import authRoutes from './auth.routes.js'
import UserRoutes from './user.routes.js'
import SettingRoutes from './settings.routes.js'
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/user', UserRoutes); 
routes.use('/setting', SettingRoutes); 

export default routes;
