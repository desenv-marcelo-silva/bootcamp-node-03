import { Router } from 'express';
import multer from 'multer';

import multerConfig from './config/multer';

import UserController from './app/controllers/UserControllers';
import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import PackageController from './app/controllers/PackageController';
import DeliveryPackController from './app/controllers/DeliveryPackController';
import DeliveryProblemsController from './app/controllers/DeliveryProblemsController';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.get(
  '/deliverypacks/:deliveryman_id/deliveries',
  DeliveryPackController.deliveries
);

routes.get(
  '/deliverypacks/:deliveryman_id/delivered',
  DeliveryPackController.delivered
);

routes.post(
  '/deliverypacks/:deliveryman_id/checkout',
  DeliveryPackController.checkout
);

routes.post(
  '/deliverypacks/:deliveryman_id/delivery',
  DeliveryPackController.delivery
);

routes.post(
  '/deliveryproblems/:deliveryman_id/problems',
  DeliveryProblemsController.store
);

routes.get('/deliveryproblems', DeliveryProblemsController.index);

routes.get(
  '/deliveryproblems/:package_id',
  DeliveryProblemsController.problems
);

routes.delete(
  '/deliveryproblems/:package_id',
  DeliveryProblemsController.delete
);

routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.use(adminMiddleware);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients', RecipientController.update);

routes.get('/deliveryman', DeliverymanController.index);
routes.post('/deliveryman', DeliverymanController.store);
routes.put('/deliveryman/:deliverymanId', DeliverymanController.update);
routes.delete('/deliveryman/:deliverymanId', DeliverymanController.delete);

routes.get('/packages/:deliverymanId', PackageController.index);
routes.post('/packages', PackageController.store);
routes.put('/packages', PackageController.update);
routes.delete('/packages/:id', PackageController.delete);

export default routes;
