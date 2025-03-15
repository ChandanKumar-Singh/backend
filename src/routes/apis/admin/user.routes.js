import { Router } from 'express';
import { AdminMiddleware } from '../../../middlewares/authenticate.js';
import UserController from '../../../controllers/User.controller.js';
import { assignQueryAndParamsToBody } from '../../../middlewares/index.js';
import SchemaValidator from '../../../middlewares/SchemaValidator.js';
import * as UserSchema from '../../../middlewares/validators/user.schema.js';
import * as DeviceSchema from '../../../middlewares/validators/device.scheme.js';
import DeviceController from '../../../controllers/DeviceController.js';


const router = Router();

router.get('/list', AdminMiddleware, UserController.list);
router.get('/:id', assignQueryAndParamsToBody, AdminMiddleware, UserController.detail);
router.post('/create', AdminMiddleware, UserController.uploadImage, SchemaValidator(UserSchema.create), UserController.create);
router.post('/update', AdminMiddleware, UserController.uploadImage, SchemaValidator(UserSchema.update), UserController.update);
router.post('/addDevice', AdminMiddleware, SchemaValidator(DeviceSchema.create), DeviceController.registerDevice);
router.get('/:userId/devices', AdminMiddleware, SchemaValidator(DeviceSchema.byUserId), DeviceController.getUserDevices);

export default router;