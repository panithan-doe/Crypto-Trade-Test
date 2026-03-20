const { Order, Wallet, sequelize } = require('../models');

exports.createOrder = async (req, res) => {
  const { user_id, side, crypto_currency, fiat_currency, price, total_amount } = req.body;


  // เริ่ม Transaction ป้องกัน race condition
  const t = await sequelize.transaction();

  try {
    
    if (side === 'SELL') {
      // LOCK Wallet
      const wallet = await Wallet.findOne({
        // WHERE id + crypto_currency 
        where: { user_id, currency: crypto_currency },
        transaction: t,
        lock: t.LOCK.UPDATE
      });
      
      if (!wallet || parseFloat(wallet.available_balance) < parseFloat(total_amount)) {
        throw new Error('ยอดเหรียญ (crypto cerrency) ใน wallet ไม่เพียงพอในการตั้งขาย');
      }
    
      await wallet.decrement('available_balance', { by: total_amount, transaction: t })
      await wallet.increment('locked_balance', {by: total_amount, transaction: t })

    } else if (side === 'BUY') {
        const totalCost = parseFloat(price) * parseFloat(total_amount);

        const wallet = await Wallet.findOne({
          // WHERE id + fiat_currency
          where: { user_id, currency: fiat_currency },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!wallet || parseFloat(wallet.available_balance) < totalCost) {
          throw new Error('ยอดเงิน (fiat currency) ใน wallet ไม่เพียงพอในการตั้งซื้อ')
        }

        await wallet.decrement('available_balance', { by: totalCost, transaction: t});
        await wallet.increment('locked_balance', { by: totalCost, transaction: t});

    }

    // CREATE Orders
    const newOrder = await Order.create({
      user_id,
      side,
      crypto_currency,
      fiat_currency,
      price,
      total_amount,
      available_amount: total_amount, // available ตอนเริ่มจะ = total_amount
      status: 'OPEN'
    }, { transaction: t });

    // SAVE
    await t.commit();

    return res.status(201).json({
      message: 'Create order completed',
      order: newOrder
    })

  } catch (error) {
    await t.rollback();
    return res.status(400).json({ error: error.message });
  }

}