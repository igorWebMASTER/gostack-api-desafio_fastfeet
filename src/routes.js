import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import SessionController from './app/controllers/SessionController'
import RecipientController from './app/controllers/RecipientController'
import DeliverymanController from './app/controllers/DeliverymanController'
import FileController from './app/controllers/FileController'
import DeliveryController from './app/controllers/DeliveryController'

import authMiddleware from './app/middlewares/auth'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/sessions', SessionController.store)

routes.use(authMiddleware)

routes.post('/recipients', RecipientController.store)
routes.put('/recipients/:id', RecipientController.update)
routes.get('/recipients', RecipientController.index)
routes.delete('/recipients/:id', RecipientController.delete)

routes.post('/files', upload.single('file'), FileController.store)

routes.post('/deliverymans', DeliverymanController.store)
routes.put('/deliverymans/:id', DeliverymanController.update)
routes.get('/deliverymans', DeliverymanController.index)
routes.delete('/deliverymans/:id', DeliverymanController.delete)

routes.post('/deliveries', DeliveryController.store)
routes.put('/deliveries/:id', DeliveryController.update)
routes.get('/deliveries', DeliveryController.index)
routes.delete('/deliveries/:id', DeliveryController.delete)

export default routes
