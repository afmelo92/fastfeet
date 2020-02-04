import { setHours, setMinutes, setSeconds, isWithinInterval } from 'date-fns';

import Product from '../models/Product';

class OrderController {
  async update(req, res) {
    const { status } = req.query;

    // Improve with switch case
    if (status && status === 'withdrawn') {
      const productExists = await Product.findAndCountAll({
        where: {
          id: req.params.productId,
        },
        attributes: ['start_date', 'end_date'],
      });

      if (productExists.count === 0) {
        return res.status(400).json({ error: 'Product does not exists' });
      }

      const initialHour = setSeconds(setMinutes(setHours(new Date(), 8), 0), 0);

      const finalHour = setSeconds(setMinutes(setHours(new Date(), 18), 0), 0);

      if (
        isWithinInterval(new Date(), {
          start: initialHour,
          end: finalHour,
        }) === false
      ) {
        return res.status(400).json({
          error: 'Deliverers can only withdrawn between 8AM - 18PM',
        });
      }

      const product = await Product.findOne({
        where: {
          id: req.params.productId,
        },
      });

      product.start_date = new Date();

      await product.save();

      return res.json({
        message: 'Product withdrawn',
        startDate: product.start_date,
      });
    }

    if (status && status === 'delivered') {
      const product = await Product.findOne({
        where: {
          id: req.params.productId,
        },
      });

      if (product.canceled_at != null) {
        return res.status(401).json({ error: 'Order already canceled' });
      }

      if (product.start_date == null) {
        return res
          .status(401)
          .json({ error: 'Product must be withdrawn before delivered' });
      }

      product.end_date = new Date();

      await product.save();

      return res.json({
        message: 'Produto entregue',
        endDate: product.end_date,
      });
    }

    return res
      .status(401)
      .json({ error: 'Withdrawn/Delivered confirmation required' });
  }
}

export default new OrderController();
