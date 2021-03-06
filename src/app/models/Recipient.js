import Sequelize, { Model } from 'sequelize';

class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        rua: Sequelize.STRING,
        bairro: Sequelize.STRING,
        numero: Sequelize.STRING,
        complemento: Sequelize.STRING,
        estado: Sequelize.STRING,
        cidade: Sequelize.STRING,
        cep: Sequelize.STRING,
        regiao_referencia: {
          type: Sequelize.VIRTUAL,
          get() {
            return `${this.bairro} - ${this.cidade}/${this.estado}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Recipient;
