import { Op } from 'sequelize';
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
    const packageProblems = await Package.findAll({
      attributes: ['id', 'product'],
      include: [
        {
          model: DeliveryProblems,
          attributes: ['id', 'description'],
          where: { id: { [Op.not]: null } },
        },
        {
          model: Recipient,
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          attributes: ['name'],
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

    const packageProblems = await Package.findAll({
      attributes: ['id', 'product'],
      where: { id: package_id },
      include: [
        {
          model: DeliveryProblems,
          attributes: ['id', 'description'],
          where: { id: { [Op.not]: null } },
        },
        {
          model: Recipient,
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          attributes: ['name'],
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

    const packageProblem = await Package.findOne({
      where: { id: package_id },
      include: [
        {
          raw: true,
          model: DeliveryProblems,
          attributes: ['id', 'description'],
        },
        {
          model: Deliveryman,
          attributes: ['id', 'name', 'email'],
        },
        {
          raw: true,
          model: Recipient,
          attributes: ['bairro', 'cidade', 'estado', 'regiao_referencia'],
        },
      ],
    });

    if (!packageProblem) {
      return Error.BadRequest(res, 'Encomenda não encontrada');
    }

    if (packageProblem.canceled_at) {
      return Error.BadRequest(res, 'Encomenda já foi cancelada anteriormente.');
    }

    const { product } = packageProblem;
    const { description: problem } = packageProblem.DeliveryProblem;
    const { regiao_referencia } = packageProblem.Recipient;

    const canceled_at = new Date();
    packageProblem.canceled_at = canceled_at;
    await packageProblem.save();

    await Notification.create({
      content: `Entrega cancelada`,
      deliveryman_id: packageProblem.Deliveryman.id,
    });

    await Queue.add(CancelMail.key, {
      deliveryman: packageProblem.Deliveryman,
      product,
      problem,
      regiao_referencia,
    });

    return res.json();
  }
}

export default new DeliveryProblemsController();
