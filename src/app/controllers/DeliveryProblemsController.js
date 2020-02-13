import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblems from '../models/DeliveryProblems';

import * as Error from '../util/Error';

class DeliveryProblemsController {
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
}

export default new DeliveryProblemsController();
