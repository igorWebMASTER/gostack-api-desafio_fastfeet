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
        const { street, number, state, city, zip_code } = req.body
        const street_check = street || recipient.street
        const number_check = number || recipient.number
        const state_check = state || recipient.state
        const city_check = city || recipient.city
        const zip_code_check = zip_code || recipient.zip_code
        if (street || number || state || city || zip_code) {
            const RecipientExists = await Recipients.findOne({
                where: {
                    street: street_check,
                    number: number_check,
                    state: state_check,
                    city: city_check,
                    zip_code: zip_code_check,
                },
            })
            if (RecipientExists) {
                return res.status(401).json({
                    error: `Recipient already exists as id ${RecipientExists.id}`,
                })
            }
        }
        const { name, complement } = await recipient.update(req.body)
        return res.json({
            id,
            name,
            street_check,
            number_check,
            complement,
            state_check,
            city_check,
            zip_code_check,
        })
    }

    async showAll(req, res) {
        const recipients = await Recipients.findAll()
        res.json(recipients)
    }

    async showOne(req, res) {
        const { id } = req.params
        const recipient = await Recipients.findByPk(id)
        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' })
        }
        return res.json(recipient)
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
            message: `Recipient id ${id} has been deleted`,
        })
    }
}

export default new RecipientController()
