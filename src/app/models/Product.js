import Sequelize, { Model } from 'sequelize';

class Product extends Model {
  static init(sequelize) {
    super.init(
      {
        recipient_id: Sequelize.INTEGER,
        deliverer_id: Sequelize.INTEGER,
        product: Sequelize.STRING,
        withdrawn: Sequelize.VIRTUAL,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    /**
     * this.addHook('beforeSave', async product => {
      if (product.withdrawn) {
        product.start_date = new Date();
      }
    });
     */
    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature',
    });
    this.belongsTo(models.Deliverer, {
      foreignKey: 'deliverer_id',
      as: 'deliverer',
    });
    this.belongsTo(models.Recipient, {
      foreignKey: 'recipient_id',
      as: 'recipient',
    });
  }
}

export default Product;
