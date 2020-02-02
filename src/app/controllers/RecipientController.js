import * as Yup from 'yup'
import Recipient from '../models/Recipient'

class RecipientController {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            street: Yup.string().required(),
            number: Yup.number().required(),
            additionalInformation: Yup.string().required(),
            state: Yup.string().required(),
            city: Yup.string().required(),
            postalCode: Yup.string().required(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' })
        }
        const {
            id,
            name,
            street,
            number,
            additionalInformation,
            state,
            city,
            postalCode,
        } = await Recipient.create(req.body)

        return res.json({
            id,
            name,
            street,
            number,
            additionalInformation,
            state,
            city,
            postalCode,
        })
    }

    async update(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            street: Yup.string(),
            number: Yup.number(),
            additionalInformation: Yup.string(),
            state: Yup.string(),
            city: Yup.string(),
            postalCode: Yup.string(),
        })
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails' })
        }

        const { id } = req.params

        const recipient = await Recipient.findByPk(id)

        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' })
        }

        const {
            name,
            street,
            number,
            additionalInformation,
            state,
            city,
            postalCode,
        } = await recipient.update(req.body)

        return res.json({
            id,
            name,
            street,
            number,
            additionalInformation,
            state,
            city,
            postalCode,
        })
    }

    async list(req, res) {
        const recipients = await Recipient.findAll()
        res.json(recipients)
    }

    async listOne(req, res) {
        const { id } = req.params
        const recipient = await Recipient.findByPk(id)
        if (!recipient) {
            return res.status(400).json({ error: 'Recipient not found' })
        }
        return res.json(recipient)
    }
}

export default new RecipientController()
