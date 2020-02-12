import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import Recipient from '../models/Recipient';

import * as Error from '../util/Error';

class DeliveryPackController {
  async deliveries(req, res) {
    const { deliveryman_id } = req.params;
    if (!deliveryman_id) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);
    if (!deliveryman) {
      return Error.BadRequest(res, 'Entregador inválido!');
    }

    const packagesDeliveryman = await Package.findAll({
      where: { deliveryman_id, canceled_at: null, end_date: null },
      attributes: ['id', 'product'],
      include: {
        model: Recipient,
        attributes: ['name', 'bairro', 'cidade'],
      },
    });

    return res.json(packagesDeliveryman);
  }
}

export default new DeliveryPackController();
