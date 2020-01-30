import Product from '../models/Product';

class OrderController {
  async update(req, res) {
    const productExists = await Product.findByPk(req.params.productId);

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exists' });
    }

    if (productExists.canceled_at != null) {
      return res.status(401).json({ error: 'Order already canceled' });
    }

    if (productExists.signature_id != null) {
      return res.status(401).json({ error: 'Product already delivered' });
    }

    if (productExists.start_date != null) {
      return res.status(401).json({ error: 'Product already withdrawed' });
    }

    await productExists.update(req.body);

    return res.json({ message: 'Product withdrawed' });
  }
}

export default new OrderController();
