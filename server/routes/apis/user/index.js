import { Router } from 'express';
import authRoutes from './auth.routes.js'
import userRoutes from './user.routes.js'
import appRoutes from './app.routes.js'
import supportRoutes from './support.routes.js'
const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/app', appRoutes );
routes.use('/support', supportRoutes );

export default routes;
