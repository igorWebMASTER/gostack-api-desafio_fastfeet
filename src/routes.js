import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import SessionController from './app/controllers/SessionController'
import RecipientController from './app/controllers/RecipientController'
import DeliverymanController from './app/controllers/DeliverymanController'
import FileController from './app/controllers/FileController'
import DeliveryController from './app/controllers/DeliveryController'
import IndexDeliveryController from './app/controllers/IndexDeliveryController'
import IndexDeliveredController from './app/controllers/IndexDeliveredController'
import IndexCancelledController from './app/controllers/IndexCancelledController'
import WithdrawController from './app/controllers/WithdrawController'
import DeliverController from './app/controllers/DeliverController'
import DeliveryProblemController from './app/controllers/DeliveryProblemController'

import authMiddleware from './app/middlewares/auth'

const routes = new Router()
const upload = multer(multerConfig)

routes.get('/deliveryman/:id/deliveries', IndexDeliveryController.index)
routes.get('/deliveryman/:id/delivered', IndexDeliveredController.index)
routes.get('/deliveryman/:id/cancelled', IndexCancelledController.index)

routes.put(
    '/deliveryman/:deliveryman_id/withdraw/:delivery_id',
    WithdrawController.update
)

routes.put(
    '/deliveryman/:deliveryman_id/delivery/:delivery_id',
    upload.single('file'),
    DeliverController.update
)

// routes.post('/delivery/:delivery_id/problems', DeliveryProblemController.store)
routes.post(
    '/deliveryman/:deliveryman_id/delivery/:delivery_id/problems',
    DeliveryProblemController.store
)

routes.post('/sessions', SessionController.store)

routes.use(authMiddleware)

routes.get('/problems', DeliveryProblemController.index)
routes.get('/delivery/:delivery_id/problems', DeliveryProblemController.show)
routes.get(
    '/problem/:problem_id/cancel-delivery',
    DeliveryProblemController.update
)

routes.post('/recipients', RecipientController.store)
routes.put('/recipients/:id', RecipientController.update)
routes.get('/recipients', RecipientController.index)
routes.get('/recipients/:id', RecipientController.show)
routes.delete('/recipients/:id', RecipientController.delete)

routes.post('/files', upload.single('file'), FileController.store)

routes.post('/deliverymans', DeliverymanController.store)
routes.put('/deliverymans/:id', DeliverymanController.update)
routes.get('/deliverymans', DeliverymanController.index)
routes.get('/deliverymans/:id', DeliverymanController.show)
routes.delete('/deliverymans/:id', DeliverymanController.delete)

routes.post('/deliveries', DeliveryController.store)
routes.put('/deliveries/:id', DeliveryController.update)
routes.get('/deliveries', DeliveryController.index)
routes.get('/deliveries/:id', DeliveryController.show)
routes.delete('/deliveries/:id', DeliveryController.delete)

export default routes
