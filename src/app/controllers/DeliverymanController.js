import * as Yup from 'yup';

import * as Error from '../util/Error';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliveryman = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email'],
      order: ['name'],
      include: {
        model: File,
        as: 'deliveryman_avatar',
        attributes: ['id', 'path', 'url'],
      },
    });
    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      Error.BadRequest(res, 'Dados inválidos.');
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExists) {
      return Error.BadRequest(res, 'Entregador já cadastrado.');
    }

    const { id, name, email } = await Deliveryman.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const { deliverymanId } = req.params;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!deliverymanId || !(await schema.isValid(req.body))) {
      Error.BadRequest(res, 'Dados inválidos.');
    }

    const deliverymanId = await Deliveryman.findByPk(deliverymanId);

    if (!deliverymanId) {
      return Error.BadRequest(res, 'Entregador não existe na base de dados.');
    }

    const { id, name, email } = await deliveryman.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async delete(req, res) {
    const { deliverymanId } = req.params;

    if (!deliverymanId) {
      Error.BadRequest(res, 'Dados inválidos.');
    }

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador não existe na base de dados.');
    }

    await deliveryman.destroy();

    return res.json({});
  }
}

export default new DeliverymanController();
