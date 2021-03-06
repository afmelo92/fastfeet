import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import RecipientController from './app/controllers/RecipientController';
import DelivererController from './app/controllers/DelivererController';
import ProductController from './app/controllers/ProductController';
import OrderController from './app/controllers/OrderController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveriesController from './app/controllers/DeliveriesController';
import ProblemController from './app/controllers/ProblemController';

import authMiddleware from './app/middlewares/auth';
import signatureMiddleware from './app/middlewares/signature';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.put(
  '/orders/:productId',
  upload.single('file'),
  signatureMiddleware,
  OrderController.update
);

routes.get('/deliveryman/:delivererId', DeliverymanController.index);
routes.get('/deliveryman/:delivererId/deliveries', DeliveriesController.index);

routes.post('/delivery/:productId/problems', ProblemController.store);

routes.use(authMiddleware);

routes.get('/recipients', RecipientController.index);
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:recipientId', RecipientController.update);
routes.delete('/recipients/:recipientId', RecipientController.delete);

routes.get('/deliverers', DelivererController.index);
routes.post('/deliverers', DelivererController.store);
routes.put('/deliverers/:delivererId', DelivererController.update);
routes.delete('/deliverers/:delivererId', DelivererController.delete);

routes.get('/products', ProductController.index);
routes.post('/products', ProductController.store);
routes.put('/products/:productId', ProductController.update);
routes.delete('/products/:productId', ProductController.delete);

routes.get('/delivery/problems', ProblemController.index);
routes.get('/delivery/:productId/problems', ProblemController.index);

routes.delete('/problem/:problemId/cancel-delivery', ProblemController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
