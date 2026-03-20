'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transfer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transfer.belongsTo(models.User, { foreignKey: 'sender_id', as: 'Sender' });
      Transfer.belongsTo(models.User, { foreignKey: 'receiver_id', as: 'Receiver' });    
    }
  }
  Transfer.init({
    sender_id: DataTypes.INTEGER,
    receiver_id: DataTypes.INTEGER,
    currency: DataTypes.STRING,
    amount: DataTypes.DECIMAL(18, 8),
    type: DataTypes.ENUM('INTERNAL', 'EXTERNAL')
  }, {
    sequelize,
    modelName: 'Transfer',
  });
  return Transfer;
};