const express = require('express');
const authMiddleware = require('../utils/authMiddleware');
const ProductModel = require('../models/Product');

module.exports = (sequelize) => {
  const router = express.Router();
  const Product = ProductModel(sequelize);

  // Get all products
  router.get('/', async (req, res) => {
    const products = await Product.findAll();
    res.json(products);
  });

  // Get product by id
  router.get('/:id', async (req, res) => {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  // Create product (admin only)
  router.post('/', authMiddleware, async (req, res) => {
    try {
      const { name, description, price, imageUrl } = req.body;
      const product = await Product.create({ name, description, price, imageUrl });
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Update product (admin only)
  router.put('/:id', authMiddleware, async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      await product.update(req.body);
      res.json(product);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Delete product (admin only)
  router.delete('/:id', authMiddleware, async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      await product.destroy();
      res.json({ message: "Product deleted" });
    } catch (err)