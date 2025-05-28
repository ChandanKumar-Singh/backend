import { Router } from 'express';
import { assignQueryAndParamsToBody } from '../../../middlewares/index.js';
import AppSettingsController from '../../../controllers/app/AppSettingsController.js';
import { UserMiddleware } from '../../../middlewares/authenticate.js';
import PageController from '../../../controllers/admin/pageController.js';
const router = Router();

router.get('/settings', assignQueryAndParamsToBody, UserMiddleware, AppSettingsController.detail);
router.get('/pages', assignQueryAndParamsToBody, UserMiddleware, PageController.list);

export default router;