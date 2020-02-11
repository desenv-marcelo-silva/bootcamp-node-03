import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserControllers';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import PackageController from './app/controllers/PackageController';

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

routes.get('/deliveryman', adminMiddleware, DeliverymanController.index);
routes.post('/deliveryman', adminMiddleware, DeliverymanController.store);
routes.put(
  '/deliveryman/:deliverymanId',
  adminMiddleware,
  DeliverymanController.update
);
routes.delete(
  '/deliveryman/:deliverymanId',
  adminMiddleware,
  DeliverymanController.delete
);

routes.get(
  '/packages/:deliverymanId',
  adminMiddleware,
  PackageController.index
);
routes.post('/packages', adminMiddleware, PackageController.store);
routes.put('/packages', adminMiddleware, PackageController.update);
routes.delete('/packages/:id', adminMiddleware, PackageController.delete);

export default routes;
