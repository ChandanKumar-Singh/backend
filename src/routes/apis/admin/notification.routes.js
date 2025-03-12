import { Router } from 'express';
import { AdminMiddleware } from '../../../middlewares/authenticate.js';
const routes = new Router();

routes.post('/', AdminMiddleware, NotificationController.list);
routes.post('/detail', AdminMiddleware, NotificationController.detail);
routes.post('/send', AdminMiddleware, NotificationController.sendNotification);
export default routes;
