import { Op } from 'sequelize';
import * as Yup from 'yup';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    const { page = 1, rec } = req.query;

    if (page === 'all') {
      const recipients = await Recipient.findAndCountAll({
        where: {
          name: {
            [Op.iLike]: { [Op.any]: [`%${rec}%`] },
          },
        },
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
      });

      if (!recipients || recipients.count === 0) {
        return res
          .status(400)
          .json({ error: 'There are no recipients registered' });
      }

      return res.json(recipients.rows);
    }

    const recipients = await Recipient.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: { [Op.any]: [`%${rec}%`] },
        },
      },
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
      limit: 20,
      offset: (page - 1) * 20,
    });

    if (!recipients || recipients.count === 0) {
      return res
        .status(400)
        .json({ error: 'There are no recipients registered' });
    }

    return res.json(recipients.rows);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip: Yup.string()
        .matches(/^[0-9]{5}(?:-[0-9]{3})?$/, 'Must be in zip format')
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const {
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    } = await Recipient.create(req.body);

    return res.json({ name, street, number, complement, state, city, zip });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.string(),
      complement: Yup.string(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      zip: Yup.string()
        .matches(/^[0-9]{5}(?:-[0-9]{3})?$/, 'Must be in zip format')
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const recipient = await Recipient.findByPk(req.params.recipientId);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    const {
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    } = await recipient.update(req.body);

    return res.json({
      name,
      street,
      number,
      complement,
      state,
      city,
      zip,
    });
  }

  async delete(req, res) {
    const recipientExists = await Recipient.findByPk(req.params.recipientId);

    if (!recipientExists) {
      return res.status(400).json({ error: 'Recipient does not exists' });
    }

    await recipientExists.destroy();

    return res.json({ message: 'Recipient deleted' });
  }
}

export default new RecipientController();
