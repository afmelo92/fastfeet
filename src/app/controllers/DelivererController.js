import { Op } from 'sequelize';
import * as Yup from 'yup';

import Deliverer from '../models/Deliverer';
import File from '../models/File';

class DelivererController {
  async index(req, res) {
    const { page = 1, dname } = req.query;

    const deliverers = await Deliverer.findAndCountAll({
      where: {
        name: {
          [Op.iLike]: { [Op.any]: [`%${dname}%`] },
        },
      },
      attributes: ['id', 'name', 'email'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    if (!deliverers || deliverers.count === 0) {
      return res
        .status(400)
        .json({ error: 'There are no deliverers registered' });
    }

    return res.json(deliverers.rows);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      avatar_id: Yup.number().integer(),
      email: Yup.string()
        .email()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const delivererExists = await Deliverer.findOne({
      where: { email: req.body.email },
    });

    if (delivererExists) {
      return res.status(400).json({ error: 'Deliverer already exists' });
    }

    const { id } = await Deliverer.create(req.body);

    const deliverer = await Deliverer.findByPk(id, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverer);
  }

  async update(req, res) {
    const delivererExists = await Deliverer.findByPk(req.params.delivererId);

    if (!delivererExists) {
      return res.status(400).json({ error: 'Deliverer does not exists' });
    }

    await delivererExists.update(req.body);

    const deliverer = await Deliverer.findByPk(req.params.delivererId, {
      attributes: ['id', 'name', 'email'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json(deliverer);
  }

  async delete(req, res) {
    const delivererExists = await Deliverer.findByPk(req.params.delivererId);

    if (!delivererExists) {
      return res.status(400).json({ error: 'Deliverer does not exists' });
    }

    await delivererExists.destroy();

    return res.json({ message: 'Deliverer deleted' });
  }
}

export default new DelivererController();
