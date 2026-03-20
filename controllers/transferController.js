const { Wallet, Transfer, sequelize } = require('../models');

exports.createTransfer = async (req, res) => {
  const { sender_id, receiver_id, currency, amount, type } = req.body;
  const transferAmount = parseFloat(amount);

  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ error: 'จำนวนเงินต้องมากกว่า 0' });
  }

  const t = await sequelize.transaction();

  try {
    // LOCK Wallet (Sender)
    const senderWallet = await Wallet.findOne({
      where: { user_id: sender_id, currency: currency },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!senderWallet) {
      throw new Error('ไม่พบ Wallet ของ Sender');
    }
    if (parseFloat(senderWallet.available_balance) < transferAmount) {
      throw new Error('ยอดเงิน Fiat ใน Wallet ไม่เพียงพอ');
    }

    let newTransfer;

    
    if (type === 'INTERNAL') {    // โอนภายในระบบ

      if (sender_id === receiver_id) {
        throw new Error('ไม่สามารถโอนให้ตัวเองได้');
      }

      // LOCK Wallet (Receiver)
      const receiverWallet = await Wallet.findOne({
        where: { user_id: receiver_id, currency: currency },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!receiverWallet) {
        throw new Error('ไม่พบ Wallet ของ Receiver');
      }

      // หักเงินคนโอน (-available) และ เพิ่มเงินคนรับ (+available)
      await senderWallet.decrement('available_balance', { by: transferAmount, transaction: t });
      await receiverWallet.increment('available_balance', { by: transferAmount, transaction: t });

      // CREATE Transfers
      newTransfer = await Transfer.create({
        sender_id: sender_id,
        receiver_id: receiver_id,
        currency: currency,
        amount: transferAmount,
        type: 'INTERNAL' 
      }, { transaction: t });

    } else if (type === 'EXTERNAL') {   // โอนนอกระบบ
      
      await senderWallet.decrement('available_balance', { by: transferAmount, transaction: t });

      // CREATE Transfers
      newTransfer = await Transfer.create({
        sender_id: sender_id,
        receiver_id: null, 
        currency: currency,
        amount: transferAmount,
        type: 'EXTERNAL'
      }, { transaction: t });

    } else {
      throw new Error('type ต้องเป็น INTERNAL || EXTERNAL)');
    }

    // SAVE
    await t.commit();
    return res.status(200).json({ 
      message: `Transfers Completed: ${type}`, 
      transfer: newTransfer 
    });

  } catch (error) {
    await t.rollback();
    return res.status(400).json({ error: error.message });
  }
};