import * as Yup from 'yup'
import { parseISO, getHours, isBefore } from 'date-fns'

import Delivery from '../models/Delivery'
import Deliveryman from '../models/Deliveryman'
import Recipient from '../models/Recipient'
import File from '../models/File'

import RegistrationMail from '../jobs/RegistrationMail'
import Queue from '../../lib/Queue'

class DeliveryController {
    async store(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
            product: Yup.string().required(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { recipient_id, deliveryman_id } = req.body
        const recipient = await Recipient.findByPk(recipient_id)
        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' })
        }
        const deliveryman = await Deliveryman.findByPk(deliveryman_id)
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
        }
        const { id, product } = await Delivery.create(req.body)
        await Queue.add(RegistrationMail.key, {
            deliveryman,
            recipient,
            product,
        })
        return res.json({
            id,
            recipient_id,
            deliveryman_id,
            product,
        })
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number(),
            deliveryman_id: Yup.number(),
            product: Yup.string(),
            canceled_at: Yup.date(),
            start_date: Yup.date(),
            end_date: Yup.date(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { id } = req.params
        const delivery = await Delivery.findByPk(id)
        if (!delivery) {
            return res.status(400).json({ error: 'Delivery not found' })
        }
        const {
            recipient_id,
            deliveryman_id,
            start_date,
            end_date,
            canceled_at,
            signature_id,
        } = req.body
        if (recipient_id) {
            const recipient = await Recipient.findByPk(recipient_id)
            if (!recipient) {
                return res.status(400).json({ error: 'Recipient not found' })
            }
        }
        if (deliveryman_id) {
            const deliveryman = await Deliveryman.findByPk(deliveryman_id)
            if (!deliveryman) {
                return res.status(400).json({ error: 'Deliveryman not found' })
            }
        }
        if (signature_id) {
            const signature = await File.findByPk(signature_id)
            if (!signature) {
                return res
                    .status(400)
                    .json({ error: 'Signature file not found' })
            }
        }
        const parsedStartDate = parseISO(start_date)
        const parsedEndDate = parseISO(end_date)
        if (start_date) {
            const hour = getHours(parsedStartDate)
            if (hour < 8 || hour > 18) {
                return res.status(400).json({
                    error: 'The start date must be between 08:00AM and 06:00PM',
                })
            }
        }
        if (end_date && !start_date) {
            if (!delivery.start_date) {
                return res.status(400).json({
                    error:
                        'The delivery must be picked up to be closed as delivered',
                })
            }
        } // TODO E se o deliveryman entregar no mesmo dia
        if (end_date) {
            if (delivery.canceled_at) {
                return res
                    .status(400)
                    .json({ error: 'This delivery is already cancelled' })
            }
            if (start_date) {
                if (isBefore(parsedEndDate, parsedStartDate)) {
                    return res.status(400).json({
                        error: 'The end date should be after the start date',
                    })
                }
            } else if (isBefore(parsedEndDate, delivery.start_date)) {
                return res.status(400).json({
                    error: 'The end date should be after the start date',
                })
            }
        }
        if (canceled_at) {
            if (delivery.end_date) {
                return res
                    .status(400)
                    .json({ error: 'This delivery is already closed' })
            }
        }

        const { product } = await delivery.update(req.body)
        return res.json({
            id,
            recipient_id: recipient_id || delivery.recipient_id,
            deliveryman_id: deliveryman_id || delivery.deliveryman_id,
            product,
            canceled_at,
            start_date: start_date || delivery.start_date,
            end_date: end_date || delivery.end_date,
            signature_id: signature_id || delivery.signature_id,
        })
    }

    async index(req, res) {
        const { page = 1 } = req.query
        const deliveries = await Delivery.findAll({
            limit: 10,
            offset: (page - 1) * 20,
            attributes: [
                'id',
                'recipient_id',
                'deliveryman_id',
                'product',
                'canceled_at',
                'start_date',
                'end_date',
                'signature_id',
            ],
            include: [
                {
                    model: Recipient,
                    as: 'recipient',
                    attributes: [
                        'id',
                        'name',
                        'street',
                        'number',
                        'complement',
                        'state',
                        'city',
                        'zip_code',
                    ],
                },
                {
                    model: Deliveryman,
                    as: 'deliveryman',
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'name', 'path', 'url'],
                        },
                    ],
                },
                {
                    model: File,
                    as: 'signature',
                    attributes: ['id', 'name', 'path', 'url'],
                },
            ],
        })
        res.json(deliveries)
    }

    async show(req, res) {
        const schema = await Yup.object().shape({
            id: Yup.number()
                .positive()
                .required(),
        })
        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { id } = req.params
        const deliveries = await Delivery.findByPk(id, {
            attributes: [
                'id',
                'recipient_id',
                'deliveryman_id',
                'product',
                'canceled_at',
                'start_date',
                'end_date',
                'signature_id',
            ],
            include: [
                {
                    model: Deliveryman,
                    as: 'deliveryman',
                    attributes: ['id', 'name', 'email'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'name', 'path', 'url'],
                        },
                    ],
                },
                {
                    model: File,
                    as: 'signature',
                    attributes: ['id', 'name', 'path', 'url'],
                },
            ],
        })
        if (!deliveries) {
            return res.status(400).json({ error: 'Delivery not found' })
        }
        return res.json(deliveries)
    }

    async delete(req, res) {
        const schema = Yup.object().shape({
            id: Yup.number()
                .positive()
                .required(),
        })
        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const { id } = req.params
        const delivery = await Delivery.findByPk(id)
        if (!delivery) {
            return res.status(400).json({ error: 'Delivery not found' })
        }
        await delivery.destroy()
        return res.json({
            message: `Delivery ID ${id} has been deleted`,
        })
    }
}

export default new DeliveryController()
