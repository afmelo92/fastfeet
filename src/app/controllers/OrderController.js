import { setHours, setMinutes, setSeconds, format } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Product from '../models/Product';

class OrderController {
  async update(req, res) {
    const { withdrawn } = req.body;
    const productExists = await Product.findByPk(req.params.productId);

    if (!productExists) {
      return res.status(400).json({ error: 'Product does not exists' });
    }

    if (productExists.canceled_at != null) {
      return res.status(400).json({ error: 'Order already canceled' });
    }

    if (productExists.signature_id != null) {
      return res.status(400).json({ error: 'Product already delivered' });
    }

    if (withdrawn) {
      if (productExists.start_date != null) {
        return res.status(400).json({ error: 'Product already withdrawed' });
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

      if (!(hourStart >= initialHour && hourStart <= finalHour)) {
        return res
          .status(400)
          .json({ error: 'Deliverers can only withdrawn between 8AM - 18PM' });
      }

      productExists.start_date = new Date();

      await productExists.save();

      return res.json(productExists);
    }

    productExists.end_date = new Date();

    await productExists.save();

    return res.json(productExists);
  }
}

export default new OrderController();
