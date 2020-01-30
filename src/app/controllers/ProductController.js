import Product from '../models/Product';
import File from '../models/File';
import Deliverer from '../models/Deliverer';
import Recipient from '../models/Recipient';

class ProductController {
  async index(req, res) {
    return res.json({ ok: true });
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
      ],
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
