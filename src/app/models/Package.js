import Sequelize, { Model } from 'sequelize';

class Package extends Model {
  static init(sequelize) {
    super.init(
      {
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
        signature_id: Sequelize.INTEGER,
        status: {
          type: Sequelize.VIRTUAL,
          get() {
            if (this.canceled_at) {
              return 'Cancelada';
            } else if (this.end_date && this.signature_id) {
              return 'Entregue';
            } else if (this.start_date && !this.end_date) {
              return 'Retirada';
            } else {
              return 'Pendente';
            }
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
    this.belongsTo(models.Recipient, { foreignKey: 'recipient_id' });
    this.belongsTo(models.Deliveryman, { foreignKey: 'deliveryman_id' });
    this.hasOne(models.DeliveryProblems, { foreignKey: 'delivery_id' });
  }
}

export default Package;
