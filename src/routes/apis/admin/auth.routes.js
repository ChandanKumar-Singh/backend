import { Router } from 'express';
import * as AuthSchema from '../../../middlewares/validators/auth.schema.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import { AdminMiddleware } from '../../../middlewares/authenticate.js';
import AdminController from '../../../controllers/AdminController.js';
const router = Router();

router.get('/list', AdminMiddleware, AdminController.list);
router.get('/deleteAll', AdminMiddleware, AdminController.deleteAll);
router.post('/create', SchemaValidator(AuthSchema.create), AdminController.create);
router.post('/login', SchemaValidator(AuthSchema.login), AdminController.login);


export default router;