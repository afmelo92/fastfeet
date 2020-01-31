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

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:recipientId', RecipientController.update);

routes.get('/deliverers', DelivererController.index);
routes.post('/deliverers', DelivererController.store);
routes.put('/deliverers/:delivererId', DelivererController.update);
routes.delete('/deliverers/:delivererId', DelivererController.delete);

routes.get('/products', ProductController.index);
routes.post('/products', ProductController.store);
routes.put('/products/:productId', ProductController.update);
routes.delete('/products/:productId', ProductController.delete);

routes.put('/orders/:productId', OrderController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
