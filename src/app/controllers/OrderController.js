import { isWithinInterval, startOfToday, addHours } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

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

      if (productExists.count >= 4) {
        return res
          .status(400)
          .json({ error: 'Only 5 withdrawns per day allowed' });
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const initialHour = utcToZonedTime(addHours(startOfToday(), 8), timezone);
      const finalHour = utcToZonedTime(addHours(startOfToday(), 18), timezone);
      const compareDate = isWithinInterval(
        utcToZonedTime(new Date(), timezone),
        {
          start: initialHour,
          end: finalHour,
        }
      );
      if (!compareDate) {
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
        return res.status(400).json({ error: 'Order already canceled' });
      }

      if (product.end_date != null) {
        return res.status(400).json({ error: 'Product already delivered' });
      }

      if (product.start_date == null) {
        return res
          .status(400)
          .json({ error: 'Product must be withdrawn before delivered' });
      }

      product.end_date = new Date();
      product.signature_id = req.signatureId;

      await product.save();

      return res.json({
        message: 'Product delivered',
        endDate: product.end_date,
      });
    }

    return res
      .status(401)
      .json({ error: 'Withdrawn/Delivered confirmation required' });
  }
}

export default new OrderController();
