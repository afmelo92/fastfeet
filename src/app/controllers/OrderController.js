import Product from '../models/Product';

class OrderController {
  async update(req, res) {
    const productExists = await Product.findByPk(req.params.productId);

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exists' });
    }

    return res.json(productExists);
  }
}

export default new OrderController();
