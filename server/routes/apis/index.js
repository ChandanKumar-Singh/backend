import { Router } from 'express';
import adminRoutes from './admin/index.js'
import userRoutes from './user/index.js'
import Constants from '../../config/constants.js';
const router = Router();

router.use(Constants.routes.admin, adminRoutes);
router.use('/', userRoutes);
router.get('/test', (r, s) => s.json({
    "array": [
        1,
        2,
        3
    ],
    "boolean": true,
    "null": null,
    "number": 123,
    "object": {
        "a": "b",
        "c": "d",
        "e": "f"
    },
    "string": "Hello World"
}))
export default router;
