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

    const delivermen = await Delivermen.create(req.body);

    return res.json(delivermen);
  }
}

export default new DelivermanController();
