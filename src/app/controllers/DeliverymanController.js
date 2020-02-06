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
        const { email } = req.body
        const deliveryman = await Deliveryman.findByPk(id)
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
        }
        if (email && email !== deliveryman.email) {
            const deliverymanExists = Deliveryman.findOne({
                where: { email },
            })
            if (deliverymanExists) {
                return res.status(401).json({
                    error: `Deliveryman already exists as ID ${deliverymanExists.id}`,
                })
            }
        }
        const { name, avatar_id } = await deliveryman.update(req.body)
        return res.json({
            id,
            name,
            email: email || deliveryman.email,
            avatar_id,
        })
    }

    async index(req, res) {
        const { page = 1 } = req.query
        const deliverymans = await Deliveryman.findAll({
            limit: 10,
            offset: (page - 1) * 20,
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
        const deliveryman = await Deliveryman.findByPk(id, {
            attributes: ['id', 'name', 'email'],
            include: [
                {
                    model: File,
                    as: 'avatar',
                    attributes: ['id', 'name', 'path', 'url'],
                },
            ],
        })
        if (!deliveryman) {
            return res.status(400).json({ error: 'Deliveryman not found' })
        }
        return res.json(deliveryman)
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
