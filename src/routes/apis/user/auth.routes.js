import { Router } from 'express';
import * as AuthSchema from '../../../middlewares/validators/auth.schema.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import { UserMiddleware } from '../../../middlewares/authenticate.js';
import AdminController from '../../../controllers/admin/AdminController.js';
const router = Router();

router.get('/list', UserMiddleware, AdminController.list);
router.get('/deleteAll', UserMiddleware, AdminController.deleteAll);
router.post('/create', SchemaValidator(AuthSchema.adminCreate), AdminController.create);
router.post('/login', SchemaValidator(AuthSchema.login), AdminController.login);
router.post('/verifyOtp', SchemaValidator(AuthSchema.verifyOTP), AdminController.verifyOTP);

export default router;