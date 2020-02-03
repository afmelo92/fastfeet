import { setHours, setMinutes, setSeconds, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Product from '../models/Product';

class OrderController {
  async update(req, res) {
    const { status } = req.query;

    // Improve with switch case
    if (status && status === 'withdrawn') {
      const productExists = await Product.findAndCountAll({
        where: {
          id: req.params.productId,
          signature_id: null,
          canceled_at: null,
          start_date: null,
        },
        attributes: ['start_date', 'end_date'],
      });

      if (productExists.count === 0) {
        return res.status(400).json({ error: 'Product does not exists' });
      }

      const initialHour = format(
        setSeconds(setMinutes(setHours(new Date(), 8), 0), 0),
        'H:mm',
        { locale: pt }
      );

      const finalHour = format(
        setSeconds(setMinutes(setHours(new Date(), 18), 0), 0),
        'H:mm',
        { locale: pt }
      );

      const hourStart = format(new Date(), 'H:mm', { locale: pt });

      if (hourStart >= initialHour && hourStart <= finalHour) {
        return res
          .status(400)
          .json({ error: 'Deliverers can only withdrawn between 8AM - 18PM' });
      }

      const product = await Product.findOne({
        where: {
          id: req.params.productId,
        },
      });

      product.start_date = new Date();

      await product.save();

      return res.json(product);
    }

    if (status && status === 'delivered') {
      const product = await Product.findOne({
        where: {
          id: req.params.productId,
        },
      });

      product.end_date = new Date();

      await product.save();

      return res.json(product);
    }

    return res
      .status(401)
      .json({ error: 'Withdraw/Deliver confirmation required' });
  }
}

export default new OrderController();
