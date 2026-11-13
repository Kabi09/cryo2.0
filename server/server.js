require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const scmRoutes = require('./routes/scmRoutes');
const salesRoutes = require('./routes/salesRoutes');
const productionRoutes = require('./routes/productionRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

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

// Health Check with Database Connectivity Status
app.get('/api/health', (req, res) => {
  const readyStates = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };
  const dbState = mongoose.connection.readyState;
  const isDbConnected = dbState === 1;

  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'UP' : 'DEGRADED',
    message: isDbConnected
      ? 'Cryo 2.0 SCM, Sales & Production API is running smoothly'
      : 'Cryo 2.0 API is running, but database connection is unavailable',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: readyStates[dbState] || 'Unknown',
      connected: isDbConnected,
      host: mongoose.connection.host || '127.0.0.1',
      port: mongoose.connection.port || 27017,
      name: mongoose.connection.name || 'cryo_scm',
      readyState: dbState
    },
    modules: {
      supplyChain: 'Active',
      sales: 'Active',
      production: 'Active',
      logistics: 'Active',
      employees: 'Active'
    }
  });
});

// API Routes
app.use('/api', scmRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/employees', employeeRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Internal Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SCM & Sales Backend Server running on port ${PORT}`);
});
