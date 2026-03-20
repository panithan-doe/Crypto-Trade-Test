'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Order.belongsTo(models.User, { foreignKey: 'user_id' });
      Order.hasMany(models.Trade, { foreignKey: 'order_id' });
    }
  }
  Order.init({
    user_id: DataTypes.INTEGER,
    side: DataTypes.ENUM('BUY', 'SELL'),
    crypto_currency: DataTypes.STRING,
    fiat_currency: DataTypes.STRING,
    price: DataTypes.DECIMAL(18, 8),
    total_amount: DataTypes.DECIMAL(18, 8),
    available_amount: DataTypes.DECIMAL(18, 8),
    status: DataTypes.ENUM('OPEN', 'CLOSED')
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};