import * as Yup from 'yup'
import Delivery from '../models/Delivery'
import File from '../models/File'

class DeliveryController {
    async store(req, res) {
        const schema = Yup.object().shape({
            recipient_id: Yup.number().required(),
            deliveryman_id: Yup.number().required(),
            product: Yup.string().required(),
            canceled_at: Yup.date(),
            start_date: Yup.date(),
            end_date: Yup.date(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const {
            id,
            recipient_id,
            deliveryman_id,
            product,
        } = await Delivery.create(req.body)
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
            product,
            canceled_at,
            start_date,
            end_date,
            signature_id,
        } = await delivery.update(req.body)
        return res.json({
            id,
            recipient_id,
            deliveryman_id,
            product,
            canceled_at,
            start_date,
            end_date,
            signature_id,
        })
    }

    async index(req, res) {
        const delivery = await Delivery.findAll({
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
                    model: File,
                    as: 'signature',
                    attributes: ['id', 'name', 'path', 'url'],
                },
            ],
        })
        res.json(delivery)
    }

    async delete(req, res) {
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
