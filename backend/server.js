const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  logging: false,
});

sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.error("Database connection error:", err));

// Sync models
const User = require('./models/User')(sequelize);
const Product = require('./models/Product')(sequelize);
const Order = require('./models/Order')(sequelize);

sequelize.sync({ alter: true })
  .then(() => console.log("Models synchronized"))
  .catch(err => console.error(err));

// API Routes
app.use('/api/auth', authRoutes(sequelize));
app.use('/api/products', productRoutes(sequelize));
app.use('/api/orders', orderRoutes(sequelize));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// For all other GET requests, send index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
