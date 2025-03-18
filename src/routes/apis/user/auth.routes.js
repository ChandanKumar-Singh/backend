import { Router } from 'express';
import * as AuthSchema from '../../../middlewares/validators/auth.schema.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import { UserMiddleware } from '../../../middlewares/authenticate.js';
import UserController from '../../../controllers/app/UserController.js';

const router = Router();

router.get('/list', UserMiddleware, UserController.list);
// router.get('/deleteAll', UserMiddleware, UserController.deleteAll);
router.post('/create', SchemaValidator(AuthSchema.create), UserController.create);
router.post('/login', SchemaValidator(AuthSchema.login), UserController.login);
router.post('/verifyOtp', SchemaValidator(AuthSchema.verifyOTP), UserController.verifyOTP);

export default router;