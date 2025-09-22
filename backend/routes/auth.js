const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const router = express.Router();
  const User = require('../models/User')(sequelize);

  // Admin login
  router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, config.jwtSecret, { expiresIn: '12h' });
    res.json({ token });
  });

  // Register admin (only for initial setup)
  router.post('/register', async (req, res) => {
    try {
      const { username, password } = req.body;
      const newUser = await User.create({ username, password });
      res.json({ message: "Admin created", user: newUser });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  return router;
};