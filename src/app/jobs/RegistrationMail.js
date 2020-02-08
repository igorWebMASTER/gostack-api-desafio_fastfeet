import Mail from '../../lib/Mail'

class RegistrationMail {
    get key() {
        return 'RegistrationMail'
    }

    async handle({ data }) {
        const { deliveryman, recipient, product } = data
        await Mail.sendMail({
            to: `${deliveryman.name} <${deliveryman.email}>`,
            subject: 'Nova entrega liberada para você',
            template: 'registration',
            context: {
                deliveryman: deliveryman.name,
                recipient: recipient.name,
                product,
            },
        })
    }
}

export default new RegistrationMail()
