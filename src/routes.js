import { Router } from 'express';

import UserController from './app/controllers/UserControllers';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipient', RecipientController.store);
routes.put('/recipient', RecipientController.update);

routes.put('/users', UserController.update);

export default routes;
