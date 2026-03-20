const { User, Wallet, sequelize } = require('../models');

exports.createUser = async (req, res) => {
  const { username, email, password_hash } = req.body;

  const t = await sequelize.transaction();

  try {
    // CREATE User
    const newUser = await User.create({
      username,
      email,
      password_hash
    }, { transaction: t });

    // Default มีแค่ Wallet ของ Fiat (THB)
    await Wallet.bulkCreate([
      { user_id: newUser.id, currency: 'THB', available_balance: 0, locked_balance: 0 },
    ], { transaction: t });

    await t.commit();

    return res.status(201).json({
      message: 'User created',
      user: newUser
    });

  } catch (error) {
    await t.rollback();
    return res.status(400).json({ error: error.message });
  }
};
