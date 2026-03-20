const { Order, Wallet, Trade, sequelize } = require('../models');

exports.matchTrade = async (req, res) => {

  const { order_id, buyer_id, seller_id, amount } = req.body; 
  const tradeAmount = parseFloat(amount);

  const t = await sequelize.transaction();

  try {
    // LOCK Order
    const order = await Order.findOne({
      where: { id: order_id },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!order) {
      throw new Error('ไม่มี Order นี้');
    }
    if (order.status !== 'OPEN') {
      throw new Error('Order นี้ปิดแล้ว (Closed)');
    }
    if (buyer_id === seller_id) {
      throw new Error('ไม่สามารถซื้อขายกับตัวเองได้');
    }
    if (parseFloat(order.available_amount) < tradeAmount) {
      throw new Error('จำนวนเหรียญ (Wallet available_amount) ที่ต้องการเทรด มีมากกว่า Order ที่เหลืออยู่ (Order available_amount)');
    }


    const tradePrice = parseFloat(order.price);
    const totalFiatCost = tradePrice * tradeAmount;

    // Manage 4 Wallets for 2 Users (2wallet/user)
    // BUYER -------------------------------
    const buyerFiat = await Wallet.findOne({ 
      where: { 
        user_id: buyer_id, 
        currency: order.fiat_currency 
      }, 
      transaction: t,
      lock: t.LOCK.UPDATE 
    });
    const buyerCrypto = await Wallet.findOne({ 
      where: { 
        user_id: buyer_id,
        currency: order.crypto_currency 
      }, 
      transaction: t,
      lock: t.LOCK.UPDATE 
    });
    
    // SELLER -------------------------------
    const sellerFiat = await Wallet.findOne({ 
      where: { 
        user_id: seller_id, 
        currency: order.fiat_currency 
      }, transaction: t, 
      lock: t.LOCK.UPDATE 
    });
    const sellerCrypto = await Wallet.findOne({ 
      where: { 
        user_id: seller_id, 
        currency: order.crypto_currency 
      }, transaction: t, 
      lock: t.LOCK.UPDATE 
    });

    if (!buyerFiat || !buyerCrypto || !sellerFiat || !sellerCrypto) {
      throw new Error('4 Wallets ของคู่เทรดไม่ครบถ้วน');
    }


    
    if (order.side === 'SELL') {
      // SELLER create Order (lock เหรียญคนขาย / คนซื้อต้องใช้ Fiat available)
      if (parseFloat(buyerFiat.available_balance) < totalFiatCost) {
        throw new Error('เงิน Fiat ของคนซื้อไม่พอ');
      }

      // คนซื้อจ่ายเงิน (-available) -> คนขายได้เงิน (+available)
      await buyerFiat.decrement('available_balance', { by: totalFiatCost, transaction: t });
      await sellerFiat.increment('available_balance', { by: totalFiatCost, transaction: t });

      // คนขายจ่ายเหรียญ (-locked_balance) -> คนซื้อได้เหรียญ (+available)
      await sellerCrypto.decrement('locked_balance', { by: tradeAmount, transaction: t });
      await buyerCrypto.increment('available_balance', { by: tradeAmount, transaction: t });

    } else if (order.side === 'BUY') {
      // BUYER create Order -> lock Fiat คนซื้อ / คนขายต้องใช้เหรียญ available)
      if (parseFloat(sellerCrypto.available_balance) < tradeAmount) {
        throw new Error('เหรียญ Crypto ของคนขายไม่พอ');
      }

      // คนขายจ่ายเหรียญ (-available) -> คนซื้อได้เหรียญ (+available)
      await sellerCrypto.decrement('available_balance', { by: tradeAmount, transaction: t });
      await buyerCrypto.increment('available_balance', { by: tradeAmount, transaction: t });

      // คนซื้อจ่าย Fiat (-locked_balance) -> คนขายได้เงิน (บวก available)
      await buyerFiat.decrement('locked_balance', { by: totalFiatCost, transaction: t });
      await sellerFiat.increment('available_balance', { by: totalFiatCost, transaction: t });
    }


    // CREATE Trades
    const newTrade = await Trade.create({
      order_id: order.id,
      buyer_id: buyer_id,
      seller_id: seller_id,
      price: tradePrice,
      crypto_amount: tradeAmount,
      fiat_amount: totalFiatCost,
      status: 'COMPLETED',
    }, { transaction: t });

    const newAvailable = parseFloat(order.available_amount) - tradeAmount;
    await order.update({
      available_amount: newAvailable,
      status: newAvailable === 0 ? 'CLOSED' : 'OPEN' 
    }, { transaction: t });

    // SAVE
    await t.commit();

    return res.status(200).json({
      message: 'Trade Completed!',
      trade: newTrade
    });

  } catch (error) {
    await t.rollback();
    return res.status(400).json({ error: error.message });
  }
};