import * as Yup from 'yup'
import Recipients from '../models/Recipient'

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
        const RecipientExists = await Recipients.findOne({
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
        } = await Recipients.create(req.body)
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
        const recipient = await Recipients.findByPk(id)
        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' })
        }
        // const { street, number, state, city, zip_code } = req.body
        // const street_check = street || recipient.street
        // const number_check = number || recipient.number
        // const state_check = state || recipient.state
        // const city_check = city || recipient.city
        // const zip_code_check = zip_code || recipient.zip_code
        if (
            req.body.street ||
            req.body.number ||
            req.body.state ||
            req.body.city ||
            req.body.zip_code
        ) {
            const RecipientExists = await Recipients.findOne({
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
        const recipients = await Recipients.findAll()
        res.json(recipients)
    }

    async delete(req, res) {
        const { id } = req.params
        const recipient = await Recipients.findByPk(id)
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
