const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const OrderModel = require('../models/Order');
const Razorpay = require('razorpay');
const config = require('../config');

module.exports = (sequelize) => {
  const router = express.Router();
  const Order = OrderModel(sequelize);

  const razorpay = new Razorpay({
    key_id: config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  });

  // Create order
  router.post('/', async (req, res) => {
    try {
      const { customerName, customerPhone, customerAddress, products, totalPrice } = req.body;

      // Create Razorpay order
      const options = {
        amount: Math.round(totalPrice * 100), // in paise
        currency: "INR",
        receipt: `order_rcpt_${Date.now()}`,
      };
      const razorpayOrder = await razorpay.orders.create(options);

      const order = await Order.create({
        customerName,
        customerPhone,
        customerAddress,
        products,
        totalPrice,
        paymentId: razorpayOrder.id,
      });

      res.json({ order, razorpayOrder });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get all orders (admin)
  router.get('/', authMiddleware, async (req, res) => {
    const orders = await Order.findAll();
    res.json(orders);
  });

  // Update order status (admin)
  router.put('/:id/status', authMiddleware, async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    await order.update({ status });
    res.json(order);
  });

  return router;
};