import { Op } from 'sequelize';

import Product from '../models/Product';
import Recipient from '../models/Recipient';

class DeliverymanController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveryman = await Product.findAndCountAll({
      where: {
        deliverer_id: req.params.delivererId,
        canceled_at: null,
        start_date: { [Op.not]: null },
      },
      attributes: ['id', 'product', 'start_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'zip',
          ],
        },
      ],
    });

    if (deliveryman.count === 0) {
      return res.status(400).json({
        error: 'There are no deliveries registered for this deliveryman',
      });
    }

    return res.json(deliveryman.rows);
  }
}

export default new DeliverymanController();
