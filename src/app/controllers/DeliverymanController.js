import * as Yup from 'yup'
import Deliveryman from '../models/Deliveryman'
import File from '../models/File'

class DeliverymanController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string()
                .email()
                .required(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const deliverymanExists = await Deliveryman.findOne({
            where: { email: req.body.email },
        })
        if (deliverymanExists) {
            return res.status(400).json({ error: 'Deliveryman already exists' })
        }
        const { id, name, email } = await Deliveryman.create(req.body)
        return res.json({
            id,
            name,
            email,
        })
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { id } = req.params
        const deliveryman = await Deliveryman.findByPk(id)
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
        }
        if (req.bodyemail) {
            const deliverymanExists = await Deliveryman.findOne({
                where: { email },
            })
            if (deliverymanExists && id != deliverymanExists.id) {
                return res.status(401).json({
                    error: `Deliveryman already exists as ID ${deliverymanExists.id}`,
                })
            }
        }
        const { name, email, avatar_id } = await deliveryman.update(req.body)
        return res.json({
            id,
            name,
            email,
            avatar_id,
        })
    }

    async index(req, res) {
        const deliverymans = await Deliveryman.findAll({
            attributes: ['id', 'name', 'email', 'avatar_id'],
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'name', 'path', 'url'],
                },
            ],
        })
        res.json(deliverymans)
    }

    async delete(req, res) {
        const { id } = req.params
        const deliveryman = await Deliveryman.findByPk(id)
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
        }
        await deliveryman.destroy()
        return res.json({
            message: `Deliveryman ID ${id} has been deleted`,
        })
    }
}

export default new DeliverymanController()
