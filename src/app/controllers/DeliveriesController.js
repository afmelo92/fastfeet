import { Op } from 'sequelize';

import Product from '../models/Product';
import Recipient from '../models/Recipient';

class DeliveriesController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const delivery = await Product.findAndCountAll({
      where: {
        deliverer_id: req.params.delivererId,
        canceled_at: null,
        start_date: { [Op.not]: null },
        end_date: { [Op.not]: null },
      },
      attributes: ['id', 'product', 'start_date', 'end_date'],
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

    if (delivery.count === 0) {
      return res.status(400).json({
        error: 'There are no deliveries registered for you',
      });
    }

    return res.json(delivery.rows);
  }
}

export default new DeliveriesController();
