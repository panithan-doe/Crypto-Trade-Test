'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wallet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Wallet.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Wallet.init({
    user_id: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    available_balance: DataTypes.DECIMAL(18, 8),
    locked_balance: DataTypes.DECIMAL(18, 8),
  }, {
    sequelize,
    modelName: 'Wallet',
  });
  return Wallet;
};