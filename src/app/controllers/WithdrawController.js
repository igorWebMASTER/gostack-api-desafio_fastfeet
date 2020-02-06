import * as Yup from 'yup'
import { parseISO, getHours, startOfDay, endOfDay } from 'date-fns'
import { Op } from 'sequelize'

import Deliveryman from '../models/Deliveryman'
import Delivery from '../models/Delivery'
import Recipient from '../models/Recipient'
import File from '../models/File'

class WithdrawController {
    async update(req, res) {
        const schema = Yup.object().shape({
            start_date: Yup.date().required(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const { deliveryman_id, delivery_id } = req.params
        const delivery = await Delivery.findByPk(delivery_id, {
            attributes: [
                'id',
                'recipient_id',
                'deliveryman_id',
                'product',
                'start_date',
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
        })
        if (!delivery) {
            return res.status(400).json({ error: 'Delivery not found' })
        }
        const deliveryman = await Deliveryman.findByPk(deliveryman_id)
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
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
        if (delivery.start_date) {
            return res
                .status(400)
                .json({ error: 'This delivery has already withdrawn' })
        }
        const { start_date } = req.body
        const parsedDate = parseISO(start_date)
        const hour = getHours(parsedDate)
        if (hour < 8 || hour > 18) {
            return res.status(400).json({
                error: 'The start date must be between 08:00AM and 06:00PM',
            })
        }
        const deliveries = await Delivery.findAll({
            where: {
                deliveryman_id,
                // canceled_at: null,
                start_date: {
                    [Op.between]: [
                        startOfDay(parsedDate),
                        endOfDay(parsedDate),
                    ],
                },
                // end_date: null,
            },
        })
        if (deliveries.length >= 50) {
            return res.status(401).json({
                error:
                    'Deliveryman already has withdrwan 5 deliveries on the day.',
            })
        }
        await delivery.update(req.body)

        return res.json(delivery)
    }
}

export default new WithdrawController()
