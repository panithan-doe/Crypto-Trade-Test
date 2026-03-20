'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('Users', [
      {
        id: 1,
        username: 'User A',
        email: 'userA@test.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        username: 'User B',
        email: 'userB@test.com',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    await queryInterface.bulkInsert('Wallets', [
      { user_id: 1, currency: 'THB', available_balance: 5000000.0, locked_balance: 0.0, createdAt: new Date(), updatedAt: new Date() },
      { user_id: 1, currency: 'BTC', available_balance: 10.0, locked_balance: 0.0, createdAt: new Date(), updatedAt: new Date() },
      
      { user_id: 2, currency: 'THB', available_balance: 10000000.0, locked_balance: 0.0, createdAt: new Date(), updatedAt: new Date() },
      { user_id: 2, currency: 'BTC', available_balance: 0.0, locked_balance: 0.0, createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Wallets', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};