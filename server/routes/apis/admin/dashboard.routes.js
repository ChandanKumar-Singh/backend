import { Router } from 'express';
import { AdminMiddleware } from '../../../middlewares/authenticate.js';
import AdminController from '../../../controllers/admin/AdminController.js';
const router = Router();

router.get('/stats', AdminMiddleware, AdminController.dashboardStats);

export default router;