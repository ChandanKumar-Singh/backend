import { Router } from 'express';
import { AdminMiddleware } from '../../../middlewares/authenticate.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import * as AppSettingSchema from '../../../middlewares/validators/appsettings.schema.js';
import AppSettingsController from '../../../controllers/admin/AppSettingsController.js';

const router = Router();

router.get('/', AdminMiddleware, AppSettingsController.detail);
router.post('/update', AdminMiddleware, SchemaValidator(AppSettingSchema.update), AppSettingsController.updateSettings);

export default router;