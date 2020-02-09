import * as Error from '../util/Error';

import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Delivermen from '../models/Delivermen';

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
}

export default new PackageController();
