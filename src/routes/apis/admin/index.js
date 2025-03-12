import { Router } from 'express';
import authRoutes from './auth.routes.js'
import UserRoutes from './user.routes.js'
import SettingRoutes from './settings.routes.js'
import PagesRoutes from './web_page.routes.js'
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/user', UserRoutes); 
routes.use('/setting', SettingRoutes);
routes.use('/page', PagesRoutes);


export default routes;
