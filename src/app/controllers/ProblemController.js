import DeliveryProblem from '../models/DeliveryProblem';
import Product from '../models/Product';
import File from '../models/File';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';

import CancelationMail from '../jobs/CancelationMail';
import Queue from '../../lib/Queue';

class ProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;

    if (req.params.productId) {
      const problemsExists = await DeliveryProblem.findAndCountAll({
        where: { delivery_id: req.params.productId },
      });

      if (problemsExists.count === 0 || !problemsExists) {
        return res
          .status(400)
          .json({ error: 'No problems registered for this delivery' });
      }

      const problems = await DeliveryProblem.findAll({
        where: { delivery_id: req.params.productId },
        attributes: ['id', 'delivery_id', 'description'],
        limit: 20,
        offset: (page - 1) * 20,
      });

      if (!problems) {
        return res.status(400).json({ error: 'No problems registered' });
      }

      return res.json(problems);
    }

    const problems = await DeliveryProblem.findAll({
      attributes: ['id', 'delivery_id', 'description'],
      limit: 20,
      offset: (page - 1) * 20,
    });

    if (!problems) {
      return res.status(400).json({ error: 'No problems registered' });
    }

    return res.json(problems);
  }

  async store(req, res) {
    const delivery_id = req.params.productId;

    const productExists = await Product.findByPk(req.params.productId);

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exists' });
    }

    const problem = await DeliveryProblem.create({
      delivery_id,
      description: req.body.description,
    });

    return res.json({
      id: problem.id,
      deliveryId: problem.delivery_id,
      description: problem.description,
    });
  }

  async delete(req, res) {
    const problemExists = await DeliveryProblem.findByPk(req.params.problemId);

    if (!problemExists) {
      return res.status(400).json({ error: 'Problem does not exists' });
    }

    const { id } = problemExists;

    const { delivery_id } = await DeliveryProblem.findOne({
      where: { id },
    });

    const product = await Product.findOne({
      where: { id: delivery_id },
      attributes: [
        'id',
        'recipient_id',
        'deliverer_id',
        'product',
        'start_date',
        'canceled_at',
      ],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'email'],
        },
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

    product.canceled_at = new Date();

    await product.save();

    await Queue.add(CancelationMail.key, {
      product,
    });

    return res.json({ message: 'Delivery canceled' });
  }
}

export default new ProblemController();
