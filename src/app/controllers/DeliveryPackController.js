import { Op } from 'sequelize';
import { startOfDay, endOfDay, isBefore, isAfter, startOfHour } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import File from '../models/File';

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
      order: ['id'],
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
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'deliveryman_avatar',
            attributes: ['id', 'path', 'url'],
          },
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

    const agora = new Date();
    const dia = agora.getDate();
    const mes = agora.getMonth();
    const ano = agora.getFullYear();
    const inicioExpediente = new Date(ano, mes, dia, 8, 0, 0);
    const finalExpediente = new Date(ano, mes, dia, 18, 0, 0);

    if (isBefore(agora, inicioExpediente)) {
      return Error.BadRequest(
        res,
        'Retiradas podem ser feitas somente a partir das 8h.'
      );
    }

    if (isAfter(agora, finalExpediente)) {
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
        start_date: { [Op.gte]: startOfDay(agora), [Op.lte]: endOfDay(agora) },
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

    if (packageToDelivery.deliveryman_id !== parseInt(deliveryman_id, 10)) {
      return Error.BadRequest(res, packageToDelivery);
    }

    packageToDelivery.start_date = agora;

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

  async deliveryInfo(req, res) {
    const { deliveryman_id, package_id } = req.params;

    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

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
      return Error.BadRequest(res, 'Entrega não pertence a este entregador.');
    }

    const packInfo = await Package.findOne({
      attributes: ['start_date', 'end_date', 'canceled_at', 'signature_id'],
      where: { id: package_id },
      include: [
        {
          model: Recipient,
          attributes: ['rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(packInfo);
  }
}

export default new DeliveryPackController();
