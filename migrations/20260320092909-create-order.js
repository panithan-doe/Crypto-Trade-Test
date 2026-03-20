'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      side: {
        type: Sequelize.ENUM('BUY', 'SELL'),
        allowNull: false
      },
      crypto_currency: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fiat_currency: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false
      },
      available_amount: {
        type: Sequelize.DECIMAL(18, 8),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'CLOSED'),
        allowNull: false,
        defaultValue: 'OPEN'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};