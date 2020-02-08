import * as Yup from 'yup'

import Delivery from '../models/Delivery'
import DeliveryProblem from '../models/DeliveryProblem'
import Recipient from '../models/Recipient'
import Deliveryman from '../models/Deliveryman'
import File from '../models/File'

import CancellationMail from '../jobs/CancellationMail'
import Queue from '../../lib/Queue'

class DeliveryProblemController {
    async store(req, res) {
        const schema = Yup.object().shape({
            description: Yup.string().required(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const { delivery_id } = req.params
        const { deliveryman_id } = req.params
        const { description } = req.body
        const delivery = await Delivery.findByPk(delivery_id, {
            attributes: [
                'id',
                'product',
                'deliveryman_id',
                'canceled_at',
                'start_date',
                'end_date',
            ],
            include: [
                {
                    model: Recipient,
                    as: 'recipient',
                    attributes: [
                        'id',
                        'name',
                        'street',
                        'complement',
                        'zip_code',
                        'city',
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
        if (!delivery) {
            return res.status(400).json({ error: 'Delivery not found' })
        }
        if (deliveryman_id != delivery.deliveryman_id) {
            return res
                .status(401)
                .json({ error: 'This delivery is not assigned to you' })
        }
        if (delivery.canceled_at) {
            return res
                .status(400)
                .json({ error: 'This delivery is already cancelled' })
        }
        if (delivery.end_date) {
            return res
                .status(400)
                .json({ error: 'This delivery is already closed' })
        }
        if (!delivery.start_date) {
            return res
                .status(400)
                .json({ error: 'This delivery has not yet been withdrawn' })
        }
        const { id } = await DeliveryProblem.create({
            delivery_id,
            description,
        })
        return res.json({
            problem: {
                id,
                delivery,
                description,
            },
        })
    }

    async index(req, res) {
        const { page = 1 } = req.query
        const deliveryProblems = await DeliveryProblem.findAll({
            limit: 10,
            offset: (page - 1) * 20,
            order: ['created_at', 'updated_at'],
            attributes: ['id', 'description'],
            include: [
                {
                    model: Delivery,
                    as: 'delivery',
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
                    ],
                },
            ],
        })
        return res.json(deliveryProblems)
    }

    async show(req, res) {
        const schema = await Yup.object().shape({
            delivery_id: Yup.number()
                .positive()
                .required(),
        })
        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { delivery_id } = req.params
        const deliveryProblems = await DeliveryProblem.findAll({
            where: { delivery_id },
            attributes: ['id', 'description'],
            include: [
                {
                    model: Delivery,
                    as: 'delivery',
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
                    ],
                },
            ],
        })
        if (deliveryProblems.length === 0) {
            return res
                .status(400)
                .json({ error: 'There are no problems to this delivery.' })
        }
        return res.json(deliveryProblems)
    }

    async update(req, res) {
        const schema = await Yup.object().shape({
            problem_id: Yup.number()
                .positive()
                .required(),
        })
        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { problem_id } = req.params
        const deliveryProblem = await DeliveryProblem.findByPk(problem_id, {
            attributes: ['id', 'description'],
            include: [
                {
                    model: Delivery,
                    as: 'delivery',
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
                    ],
                },
            ],
        })
        if (!deliveryProblem) {
            return res.status(400).json({ error: 'Problem ID not found' })
        }
        const { id } = deliveryProblem.delivery
        const delivery = await Delivery.findByPk(id, {
            attributes: [
                'id',
                'recipient_id',
                'deliveryman_id',
                'product',
                'canceled_at',
                'start_date',
                'end_date',
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
            ],
        })
        const { canceled_at } = delivery
        // if (canceled_at) {
        //     return res
        //         .status(400)
        //         .json({ error: 'This delivery is already cancelled.' })
        // }
        const date = new Date()
        await delivery.update({ canceled_at: date })
        await Queue.add(CancellationMail.key, {
            delivery,
            deliveryProblem,
        })
        return res.json(delivery)
    }
}

export default new DeliveryProblemController()
