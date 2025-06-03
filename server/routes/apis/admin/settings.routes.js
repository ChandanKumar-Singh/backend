import { Router } from 'express';
import { AuthOptionalMiddleware, AdminMiddleware } from '../../../middlewares/authenticate.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import * as AppSettingSchema from '../../../middlewares/validators/appsettings.validators.js';
import AppSettingsController from '../../../controllers/admin/AppSettingsController.js';

const router = Router();

router.get('/', AuthOptionalMiddleware, AdminMiddleware, AppSettingsController.detail);
router.post('/update', AdminMiddleware, AppSettingsController.uploadImage, SchemaValidator(AppSettingSchema.update), AppSettingsController.updateSettings);

export default router;