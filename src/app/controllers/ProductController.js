import { Op } from 'sequelize';

import Product from '../models/Product';
import File from '../models/File';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';

import DeliveryMail from '../jobs/DeliveryMail';
import Queue from '../../lib/Queue';

class ProductController {
  async index(req, res) {
    const { page = 1, prod } = req.query;

    if (page === 'all') {
      const products = await Product.findAndCountAll({
        where: {
          product: {
            [Op.iLike]: { [Op.any]: [`%${prod}%`] },
          },
        },
        attributes: [
          'id',
          'recipient_id',
          'deliverer_id',
          'product',
          'start_date',
          'end_date',
          'canceled_at',
        ],
        include: [
          {
            model: File,
            as: 'signature',
            attributes: ['name', 'path', 'url'],
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: ['name', 'city', 'state'],
          },
          {
            model: Deliverer,
            as: 'deliverer',
            attributes: ['id', 'name', 'email'],
            include: [
              {
                model: File,
                as: 'avatar',
                attributes: ['name', 'path', 'url'],
              },
            ],
          },
        ],
      });

      if (!products || products.count === 0) {
        return res
          .status(400)
          .json({ error: 'There are no products registered' });
      }

      return res.json(products.rows);
    }

    const products = await Product.findAndCountAll({
      where: {
        product: {
          [Op.iLike]: { [Op.any]: [`%${prod}%`] },
        },
      },
      attributes: [
        'id',
        'recipient_id',
        'deliverer_id',
        'product',
        'start_date',
        'end_date',
        'canceled_at',
      ],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state'],
        },
        {
          model: Deliverer,
          as: 'deliverer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!products || products.count === 0) {
      return res
        .status(400)
        .json({ error: 'There are no products registered' });
    }

    return res.json(products.rows);
  }

  async store(req, res) {
    const delivererExists = await Deliverer.findOne({
      where: { id: req.body.deliverer_id },
    });

    if (!delivererExists) {
      return res.status(400).json({ error: 'Deliverer does not exists' });
    }

    const recipientExists = await Recipient.findOne({
      where: { id: req.body.recipient_id },
    });

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const { id } = await Product.create(req.body);

    const product = await Product.findByPk(id, {
      attributes: ['id', 'recipient_id', 'deliverer_id', 'product'],
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

    await Queue.add(DeliveryMail.key, {
      product,
    });

    return res.json(product);
  }

  async update(req, res) {
    const delivererExists = await Deliverer.findOne({
      where: { id: req.body.deliverer_id },
    });

    if (!delivererExists) {
      return res.status(400).json({ error: 'Deliverer does not exists' });
    }

    const recipientExists = await Recipient.findOne({
      where: { id: req.body.recipient_id },
    });

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const productExists = await Product.findByPk(req.params.productId);

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exists' });
    }

    await productExists.update(req.body);

    const product = await Product.findByPk(req.params.productId, {
      attributes: ['id', 'recipient_id', 'deliverer_id', 'product'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(product);
  }

  async delete(req, res) {
    const productExists = await Product.findByPk(req.params.productId);

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exists' });
    }

    await productExists.destroy();

    return res.json({ message: 'Product deleted' });
  }
}

export default new ProductController();
