import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserControllers';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DelivermanController from './app/controllers/DelivermanController';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/recipients', adminMiddleware, RecipientController.store);
routes.put('/recipients', adminMiddleware, RecipientController.update);

routes.post('/delivermen', adminMiddleware, DelivermanController.store);
routes.put(
  '/delivermen/:delivermanId',
  adminMiddleware,
  DelivermanController.update
);

export default routes;
