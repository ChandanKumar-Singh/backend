import { Router } from 'express';
import UserController from '../../../controllers/admin/UserController.js';
import { assignQueryAndParamsToBody } from '../../../middlewares/index.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import * as UserSchema from '../../../middlewares/validators/user.validators.js';
import * as DeviceSchema from '../../../middlewares/validators/device.validators.js';
import DeviceController from '../../../controllers/admin/DeviceController.js';
import { UserMiddleware } from '../../../middlewares/authenticate.js';


const router = Router();

router.post('/', assignQueryAndParamsToBody, UserMiddleware, UserController.list);
router.get('/:id', assignQueryAndParamsToBody, UserMiddleware, UserController.detail);
router.post('/create', UserMiddleware, UserController.uploadImage, SchemaValidator(UserSchema.create), UserController.create);
router.post('/update', UserMiddleware, UserController.uploadImage, SchemaValidator(UserSchema.update), UserController.update);
router.post('/addDevice', UserMiddleware, SchemaValidator(DeviceSchema.create), DeviceController.registerDevice);
router.get('/:userId/devices', UserMiddleware, SchemaValidator(DeviceSchema.byUserId), DeviceController.getUserDevices);
router.get('/:id/sendMail/:template', assignQueryAndParamsToBody, UserController.sendMail);

export default router;