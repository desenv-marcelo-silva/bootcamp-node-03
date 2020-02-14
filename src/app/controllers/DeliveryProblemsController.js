import * as Yup from 'yup';

import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblems from '../models/DeliveryProblems';
import Notification from '../models/schemas/Notification';
import CancelMail from '../jobs/CancelMail';
import Queue from '../../lib/Queue';

import * as Error from '../util/Error';

class DeliveryProblemsController {
  async store(req, res) {
    const { deliveryman_id } = req.params;

    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Código do entregador inválido.');
    }

    const schema = Yup.object().shape({
      delivery_id: Yup.number().required(),
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return Error.BadRequest(res, 'Campos inválidos.');
    }

    const packages = await Package.findByPk(req.body.delivery_id);
    if (!packages) {
      return Error.BadRequest(res, 'Encomenda não encontrada.');
    }

    if (packages.deliveryman_id !== Number(deliveryman_id)) {
      return Error.BadRequest(
        res,
        'Somente o entregador titular pode reportar o problema.'
      );
    }

    const deliveryProblems = await DeliveryProblems.create(req.body);

    return res.json(deliveryProblems);
  }

  async index(req, res) {
    const packageProblems = await DeliveryProblems.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Package,
          attributes: ['id', 'product'],
          include: [
            {
              model: Recipient,
              attributes: ['name'],
            },
            {
              model: Deliveryman,
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    return res.json(packageProblems);
  }

  async problems(req, res) {
    const { package_id } = req.params;
    if (!package_id) {
      return Error.BadRequest(res, 'Parâmetros inválidos.');
    }

    const packageProblems = await DeliveryProblems.findAll({
      where: { delivery_id: package_id },
      attributes: ['description'],
      include: [
        {
          model: Package,
          attributes: ['product'],
          include: [
            {
              model: Recipient,
              attributes: ['name'],
            },
            {
              model: Deliveryman,
              attributes: ['name'],
            },
          ],
        },
      ],
    });

    return res.json(packageProblems);
  }

  async delete(req, res) {
    const { package_id } = req.params;
    if (!package_id) {
      return Error.BadRequest(res, 'Parâmetros inválidos.');
    }

    const deliveryProblem = await DeliveryProblems.findOne({
      where: { delivery_id: package_id },
      include: {
        model: Package,
        attributes: ['id', 'product'],
        include: [
          {
            model: Deliveryman,
            attributes: ['name', 'id'],
          },
          {
            model: Recipient,
            attributes: ['enderecoReferencia'],
          },
        ],
      },
    });

    if (!deliveryProblem) {
      return Error.BadRequest(res, 'Encomenda não encontrada');
    }

    const { product } = deliveryProblem.Package;
    const { name } = deliveryProblem.Deliveryman.name;
    const { enderecoReferencia } = deliveryProblem.Recipient;

    const cancelPackage = await Package.findByPk(deliveryProblem.Package.id);
    cancelPackage.canceled_at = new Date();
    const { id } = await cancelPackage.save();

    await Notification.create({
      content: `Entrega cancelada`,
      deliveryman_id: deliveryProblem.Deliveryman.id,
    });

    await Queue.add(CancelMail.key, {
      name,
      product,
      enderecoReferencia,
    });

    return res.json({ id });
  }
}

export default new DeliveryProblemsController();
