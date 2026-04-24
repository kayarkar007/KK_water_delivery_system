const mongoose = require('mongoose');

const customerDeliverySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: '' },
  normalCansDelivered: { type: Number, default: 0 },
  coolCansDelivered: { type: Number, default: 0 },
  emptyNormalCansCollected: { type: Number, default: 0 },
  emptyCoolCansCollected: { type: Number, default: 0 },
  deliveredAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ['pending', 'delivered', 'skipped'],
    default: 'pending'
  },
  notes: { type: String, default: '' }
}, { _id: true });

const tripSchema = new mongoose.Schema({
  tripNumber: { type: Number, required: true },
  normalCansLoaded: { type: Number, default: 0 },
  coolCansLoaded: { type: Number, default: 0 },
  normalCansRemaining: { type: Number, default: 0 },
  coolCansRemaining: { type: Number, default: 0 },
  normalCansDelivered: { type: Number, default: 0 },
  coolCansDelivered: { type: Number, default: 0 },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  status: {
    type: String,
    enum: ['loading', 'in_progress', 'completed'],
    default: 'loading'
  },
  deliveries: [customerDeliverySchema]
}, { _id: true });

const deliverySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  dateString: {
    type: String, // "2026-04-24" for easy querying
    required: true
  },
  status: {
    type: String,
    enum: ['loading', 'in_progress', 'completed'],
    default: 'loading'
  },
  trips: [tripSchema],
  currentTripNumber: { type: Number, default: 1 },
  // Totals
  totalNormalCansLoaded: { type: Number, default: 0 },
  totalCoolCansLoaded: { type: Number, default: 0 },
  totalNormalCansDelivered: { type: Number, default: 0 },
  totalCoolCansDelivered: { type: Number, default: 0 },
  totalEmptyCansCollected: { type: Number, default: 0 },
  totalCustomersServed: { type: Number, default: 0 },
  // Timing
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null }
}, {
  timestamps: true
});

// Index for date queries
deliverySchema.index({ dateString: 1 });
deliverySchema.index({ date: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
