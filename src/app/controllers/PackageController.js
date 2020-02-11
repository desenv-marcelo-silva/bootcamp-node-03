import * as Yup from 'yup';

import * as Error from '../util/Error';

import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Delivermen from '../models/Delivermen';
import Notification from '../models/schemas/notification';

class PackageController {
  async index(req, res) {
    const { deliverymanId: deliveryman_id } = req.params;

    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Parametros inválidos.');
    }

    const packages = await Package.findAll({
      where: { deliveryman_id },
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      order: ['created_at', 'product'],
      include: [
        {
          model: Recipient,
          attributes: ['name'],
        },
        {
          model: Delivermen,
          attributes: ['name'],
        },
      ],
    });

    return res.json(packages);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      product: Yup.string().required(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return Error.BadRequest(res, 'Dados inválidos.');
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return Error.BadRequest(res, 'Destinatário inválido.');
    }

    const deliveryman = await Delivermen.findByPk(req.body.deliveryman_id);

    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador inválido.');
    }

    const { id, product } = await Package.create(req.body);

    await Notification.create({
      content: `Nova entrega cadastrada`,
      deliveryman_id: req.body.deliveryman_id,
    });

    return res.json({ id, product });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      product: Yup.string(),
      recipient_id: Yup.number().required(),
      deliveryman_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return Error.BadRequest(res, 'Dados inválidos.');
    }
    const packages = await Package.findByPk(req.body.id);
    if (!packages) {
      return Error.BadRequest(
        res,
        'Encomenda não encontrada na base de dados.'
      );
    }

    const recipient = await Recipient.findByPk(req.body.recipient_id);
    if (!recipient) {
      return Error.BadRequest(res, 'Destinatário inválido.');
    }

    const deliveryman = await Delivermen.findByPk(req.body.deliveryman_id);
    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador inválido.');
    }

    const { id, product } = await packages.update(req.body);

    return res.json({ id, product });
  }

  async delete(req, res) {
    const { id } = req.params;
    if (!id) {
      return Error.BadRequest(res, 'Encomenda inválida.');
    }

    const packages = await Package.findByPk(id);
    if (!packages) {
      return Error.BadRequest(
        res,
        'Encomenda não encontrada na base de dados.'
      );
    }

    await packages.destroy();

    return res.json({});
  }
}

export default new PackageController();
