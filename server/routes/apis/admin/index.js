import { Router } from 'express';
import authRoutes from './auth.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import UserRoutes from './user.routes.js'
import NotificationRoutes from './notification.routes.js'
import SettingRoutes from './settings.routes.js'
import PagesRoutes from './web_page.routes.js'
import SupportRoutes from './support.routes.js'
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/dashboard', dashboardRoutes);
routes.use('/user', UserRoutes);
routes.use('/notification', NotificationRoutes)
routes.use('/setting', SettingRoutes);
routes.use('/page', PagesRoutes);
routes.use('/support', SupportRoutes);



export default routes;
