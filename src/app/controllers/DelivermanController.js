import * as Yup from 'yup';

import * as Error from '../util/Error';
import Delivermen from '../models/Delivermen';

class DelivermanController {
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

    const delivermanExists = await Delivermen.findOne({
      where: { email: req.body.email },
    });

    if (delivermanExists) {
      return Error.BadRequest(res, 'Entregador já cadastrado.');
    }

    const { id, name, email } = await Delivermen.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const { delivermanId } = req.params;

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    if (!delivermanId || !(await schema.isValid(req.body))) {
      Error.BadRequest(res, 'Dados inválidos.');
    }

    const deliverman = await Delivermen.findByPk(delivermanId);

    if (!deliverman) {
      return Error.BadRequest(res, 'Entregador não existe na base de dados.');
    }

    const { id, name, email } = await deliverman.update(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }
}

export default new DelivermanController();
