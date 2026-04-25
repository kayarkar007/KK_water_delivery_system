const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ─── Middleware ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── MongoDB Connection (Cached for Vercel Serverless) ─
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kk-waterplant';

let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

// Connect on startup
connectDB();

// Ensure DB connection on every request (for Vercel cold starts)
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// ─── Routes ───────────────────────────────────────────
const customerRoutes = require('./routes/customers');
const deliveryRoutes = require('./routes/deliveries');
const billingRoutes = require('./routes/billing');
const reportRoutes = require('./routes/reports');

app.use('/api/customers', customerRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);

// ─── Health Check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'KK Waterplant API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// ─── Root Route ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ 
    name: 'KK Events & Water Plant - Delivery API',
    version: '1.0.0',
    health: '/api/health'
  });
});

// ─── Error Handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// ─── Start Server (Local dev only, Vercel handles this) ─
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 KK Waterplant API running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  });
}

// Export for Vercel
module.exports = app;
