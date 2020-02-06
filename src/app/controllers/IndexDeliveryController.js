import * as Yup from 'yup'

import Delivery from '../models/Delivery'
import Deliveryman from '../models/Deliveryman'
import Recipient from '../models/Recipient'
import File from '../models/File'

class IndexDeliveryController {
    async index(req, res) {
        const schema = Yup.object().shape({
            id: Yup.number()
                .positive()
                .required(),
        })
        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const { id } = req.params
        const deliveryman = await Deliveryman.findByPk(id)
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
        }
        const { page = 1 } = req.query
        const deliveries = await Delivery.findAll({
            limit: 10,
            offset: (page - 1) * 20,
            attributes: [
                'id',
                'recipient_id',
                'deliveryman_id',
                'product',
                'start_date',
            ],
            where: {
                deliveryman_id: id,
                canceled_at: null,
                end_date: null,
            },
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
        return res.json(deliveries)
    }
}

export default new IndexDeliveryController()
