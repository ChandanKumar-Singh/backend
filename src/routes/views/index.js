import { Router } from 'express';
import { AdminMiddleware } from '../../middlewares/authenticate.js';
import ApiError from '../../middlewares/ApiError.js';
import httpStatus from 'http-status';
const router = Router();

const AppName = "MyApp";

const renderView = (viewName, options = {}) => (req, res) => {
throw new ApiError(httpStatus.OK,"Nothings")
    res.render(viewName, { appName: AppName, ...options });
};

const redirect = (viewName) => (req, res) => {
    res.redirect(viewName);
};

router.get('/', redirect('/home'));
router.get('/home', renderView('index', { title: 'Home' }));
router.get('/auth', AdminMiddleware, renderView('index', { title: 'Home' }));

export default router;
