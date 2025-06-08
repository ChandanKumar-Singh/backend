import { Router } from 'express';
import { AdminMiddleware } from '../../../middlewares/authenticate.js';
import NotificationController from '../../../controllers/NotificationController.js';
const routes = new Router();

routes.post('/list', AdminMiddleware, NotificationController.list);
// routes.post('/detail', AdminMiddleware, NotificationController.detail);
// routes.post('/send', AdminMiddleware, NotificationController.sendNotification);
export default routes;
