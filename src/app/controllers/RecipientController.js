import * as Yup from 'yup'
import Recipient from '../models/Recipient'

class RecipientController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            street: Yup.string().required(),
            number: Yup.number()
                .positive()
                .required(),
            complement: Yup.string(),
            state: Yup.string().required(),
            city: Yup.string().required(),
            zip_code: Yup.string()
                .length(8)
                .matches(/[0-9]+/gi)
                .required(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const RecipientExists = await Recipient.findOne({
            where: {
                street: req.body.street,
                number: req.body.number,
                state: req.body.state,
                city: req.body.city,
                zip_code: req.body.zip_code,
            },
        })
        if (RecipientExists) {
            return res.status(401).json({
                error: 'Recipient already exists',
            })
        }
        const {
            id,
            name,
            street,
            number,
            complement,
            state,
            city,
            zip_code,
        } = await Recipient.create(req.body)
        return res.json({
            id,
            name,
            street,
            number,
            complement,
            state,
            city,
            zip_code,
        })
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            street: Yup.string(),
            number: Yup.number(),
            complement: Yup.string(),
            state: Yup.string(),
            city: Yup.string(),
            zip_code: Yup.string()
                .length(8)
                .matches(/[0-9]+/gi),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const { id } = req.params
        const recipient = await Recipient.findByPk(id)
        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' })
        }
        if (
            req.body.street ||
            req.body.number ||
            req.body.state ||
            req.body.city ||
            req.body.zip_code
        ) {
            const RecipientExists = await Recipient.findOne({
                where: {
                    street: req.body.street || recipient.street,
                    number: req.body.number || recipient.number,
                    state: req.body.state || recipient.state,
                    city: req.body.city || recipient.city,
                    zip_code: req.body.zip_code || recipient.zip_code,
                },
            })
            if (RecipientExists && id != RecipientExists.id) {
                return res.status(401).json({
                    error: `Recipient already exists as ID ${RecipientExists.id}`,
                })
            }
        }
        const {
            name,
            street,
            number,
            complement,
            state,
            city,
            zip_code,
        } = await recipient.update(req.body)
        return res.json({
            id,
            name,
            street,
            number,
            complement,
            state,
            city,
            zip_code,
        })
    }

    async index(req, res) {
        const { page = 1 } = req.query
        const recipients = await Recipient.findAll({
            limit: 10,
            offset: (page - 1) * 20,
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
        })
        res.json(recipients)
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
        const recipients = await Recipient.findByPk(id, {
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
        })
        return res.json(recipients)
    }

    async delete(req, res) {
        const schema = Yup.object().shape({
            id: Yup.number()
                .positive()
                .required(),
        })
        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validations fails' })
        }
        const { id } = req.params
        const recipient = await Recipient.findByPk(id)
        if (!recipient) {
            return res.status(401).json({
                error: 'Recipient not found',
            })
        }
        await recipient.destroy()
        return res.json({
            message: `Recipient ID ${id} has been deleted`,
        })
    }
}

export default new RecipientController()
