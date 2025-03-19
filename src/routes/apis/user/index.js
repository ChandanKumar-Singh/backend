import { Router } from 'express';
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import appRoutes from './app.routes.js'
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/app', appRoutes );

export default routes;
