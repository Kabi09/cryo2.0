require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const scmRoutes = require('./routes/scmRoutes');
const salesRoutes = require('./routes/salesRoutes');
const productionRoutes = require('./routes/productionRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', message: 'Cryo 2.0 SCM, Sales & Production API is running smoothly' });
});

// API Routes
app.use('/api', scmRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/logistics', logisticsRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Internal Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SCM & Sales Backend Server running on port ${PORT}`);
});
