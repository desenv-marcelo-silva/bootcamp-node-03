import { Op } from 'sequelize';
import { startOfDay, endOfDay, isBefore, isAfter, startOfHour } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import Recipient from '../models/Recipient';

import * as Error from '../util/Error';

class DeliveryPackController {
  async index(req, res) {
    const filter = {};
    const { q } = req.query;

    if (q && q.trim() !== '') {
      filter.product = { [Op.iLike]: `%${q}%` };
    }

    const packages = await Package.findAll({
      attributes: [
        'id',
        'product',
        'start_date',
        'canceled_at',
        'end_date',
        'signature_id',
        'status',
      ],
      where: filter,
      include: [
        {
          model: Recipient,
          attributes: [
            'name',
            'bairro',
            'cidade',
            'estado',
            'regiao_referencia',
          ],
        },
        {
          model: Deliveryman,
          attributes: ['name'],
        },
      ],
    });

    return res.json(packages);
  }

  async deliveries(req, res) {
    const { deliveryman_id } = req.params;
    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador não existe!');
    }

    const filter = {};
    const { q } = req.query;

    if (q && q.trim() !== '') {
      filter.name = { [Op.iLike]: `%${q}%` };
    }

    const packagesDeliveryman = await Package.findAll({
      where: { deliveryman_id, canceled_at: null, end_date: null },
      attributes: ['id', 'product'],
      include: {
        model: Recipient,
        attributes: ['name', 'bairro', 'cidade'],
        where: filter,
      },
    });

    return res.json(packagesDeliveryman);
  }

  async delivered(req, res) {
    const { deliveryman_id } = req.params;
    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador não existe!');
    }

    const packagesDelivered = await Package.findAll({
      where: { deliveryman_id, canceled_at: null, end_date: { [Op.ne]: null } },
      attributes: ['id', 'product'],
      include: {
        model: Recipient,
        attributes: ['name', 'bairro', 'cidade'],
      },
    });

    return res.json(packagesDelivered);
  }

  async checkout(req, res) {
    const { deliveryman_id } = req.params;

    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

    const { package_id } = req.body;
    if (!package_id) {
      return Error.BadRequest(res, 'Parâmetros inválidos.');
    }

    const hoje = new Date();
    const agora = hoje.getHours();

    if (isBefore(agora, startOfHour(hoje.setHours(8)))) {
      return Error.BadRequest(
        res,
        'Retiradas podem ser feitas somente a partir das 8h.'
      );
    }

    if (isAfter(startOfHour(hoje.setHours(18)), agora)) {
      return Error.BadRequest(
        res,
        'Retiradas podem ser feitas somente até às 18h.'
      );
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador não existe!');
    }

    const countDeliveries = await Package.count({
      where: {
        deliveryman_id,
        start_date: { [Op.gte]: startOfDay(hoje), [Op.lte]: endOfDay(hoje) },
      },
    });
    if (countDeliveries + 1 > 5) {
      return Error.BadRequest(
        res,
        'Somente 5 retiradas são permitidas por dia.'
      );
    }

    const packageToDelivery = await Package.findByPk(package_id);
    if (!packageToDelivery) {
      return Error.BadRequest(res, 'Entrega não existe na base.');
    }

    if (packageToDelivery.deliveryman_id !== deliveryman_id) {
      return Error.BadRequest(
        res,
        'Retirada não permitida para este entregador.'
      );
    }

    packageToDelivery.start_date = hoje;

    await packageToDelivery.save();

    return res.json(packageToDelivery);
  }

  async delivery(req, res) {
    const { deliveryman_id } = req.params;

    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

    const { package_id } = req.body;
    if (!package_id) {
      return Error.BadRequest(res, 'Parâmetros inválidos.');
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador não existe.');
    }

    const packageDelivered = await Package.findByPk(package_id);
    if (!packageDelivered) {
      return Error.BadRequest(res, 'Entrega não existe na base.');
    }

    if (packageDelivered.deliveryman_id !== Number(deliveryman_id)) {
      return Error.BadRequest(
        res,
        'Entrega não permitida para este entregador.'
      );
    }

    packageDelivered.end_date = new Date();

    const { signature_id } = req.body;
    if (signature_id) {
      packageDelivered.signature_id = signature_id;
    }

    await packageDelivered.save();

    return res.json(packageDelivered);
  }
}

export default new DeliveryPackController();
