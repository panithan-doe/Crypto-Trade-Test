const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const orderController = require('../controllers/orderController');
const tradeController = require('../controllers/tradeController');
const transferController = require('../controllers/transferController');

router.post('/users', userController.createUser);
router.post('/orders', orderController.createOrder);
router.post('/trades', tradeController.matchTrade);
router.post('/transfers', transferController.createTransfer);


module.exports = router;