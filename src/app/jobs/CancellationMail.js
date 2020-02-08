import Mail from '../../lib/Mail'

class CancellationMail {
    get key() {
        return 'CancellationMail'
    }

    async handle({ data }) {
        const { delivery, deliveryProblem } = data
        await Mail.sendMail({
            to: `${delivery.deliveryman.name} <${delivery.deliveryman.email}>`,
            subject: 'Uma entrega foi cancelada',
            template: 'cancellation',
            context: {
                deliveryman: delivery.deliveryman.name,
                recipient: delivery.recipient.name,
                product: delivery.product,
                description: deliveryProblem.description,
            },
        })
    }
}

export default new CancellationMail()
