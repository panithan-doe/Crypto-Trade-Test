'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Wallet, { foreignKey: 'user_id' });

      User.hasMany(models.Order, { foreignKey: 'user_id' });
      
      // 1 User มีประวัติ Trade ได้หลายอัน แยกซื้อ/ขาย 
      User.hasMany(models.Trade, { foreignKey: 'buyer_id', as: 'BuyTrades' });
      User.hasMany(models.Trade, { foreignKey: 'seller_id', as: 'SellTrades' });
      
      // 1 User มีประวัติ Transfer ได้หลายอัน แยกฝั่งโอนออก/ฝั่งรับเข้า
      User.hasMany(models.Transfer, { foreignKey: 'sender_id', as: 'SentTransfers' });
      User.hasMany(models.Transfer, { foreignKey: 'receiver_id', as: 'ReceivedTransfers' });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password_hash: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};