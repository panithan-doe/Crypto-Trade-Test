'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Trade extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Trade.belongsTo(models.Order, { foreignKey: 'order_id' });
      
      Trade.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'Buyer' });
      Trade.belongsTo(models.User, { foreignKey: 'seller_id', as: 'Seller' });
    }
  }
  Trade.init({
    order_id: DataTypes.INTEGER,
    buyer_id: DataTypes.INTEGER,
    seller_id: DataTypes.INTEGER,
    crypto_amount: DataTypes.DECIMAL(18, 8),
    fiat_amount: DataTypes.DECIMAL(18, 8),
    status: DataTypes.ENUM('PENDING', 'COMPLETED'),
    price: DataTypes.DECIMAL(18, 8)
  }, {
    sequelize,
    modelName: 'Trade',
  });
  return Trade;
};