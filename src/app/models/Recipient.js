import Sequelize, { Model } from 'sequelize'

class Recipient extends Model {
    static init(sequelize) {
        super.init(
            {
                name: Sequelize.STRING,
                street: Sequelize.STRING,
                number: Sequelize.INTEGER,
                additionalInformation: Sequelize.STRING,
                state: Sequelize.STRING,
                city: Sequelize.STRING,
                postalCode: Sequelize.STRING,
            },
            {
                sequelize,
            }
        )
        return this
    }
}

export default Recipient
