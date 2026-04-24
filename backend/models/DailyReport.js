const mongoose = require('mongoose');

const deliveryDetailSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerName: { type: String, required: true },
  normalCans: { type: Number, default: 0 },
  coolCans: { type: Number, default: 0 },
  emptyCansCollected: { type: Number, default: 0 },
  deliveredAt: { type: Date },
  tripNumber: { type: Number, default: 1 }
}, { _id: false });

const dailyReportSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  dateString: { type: String, required: true, unique: true }, // "2026-04-24"
  // Summary
  totalTrips: { type: Number, default: 0 },
  totalCustomersServed: { type: Number, default: 0 },
  totalNormalCansDelivered: { type: Number, default: 0 },
  totalCoolCansDelivered: { type: Number, default: 0 },
  totalCansDelivered: { type: Number, default: 0 },
  totalEmptyCansCollected: { type: Number, default: 0 },
  // Revenue
  totalRevenue: { type: Number, default: 0 },
  totalPaymentsReceived: { type: Number, default: 0 },
  // Trip-wise breakdown
  tripDetails: [{
    tripNumber: Number,
    normalCansLoaded: Number,
    coolCansLoaded: Number,
    normalCansDelivered: Number,
    coolCansDelivered: Number,
    customersServed: Number,
    startTime: Date,
    endTime: Date
  }],
  // Customer-wise breakdown
  deliveryDetails: [deliveryDetailSchema],
  // Timing
  deliveryStartTime: { type: Date },
  deliveryEndTime: { type: Date }
}, {
  timestamps: true
});

dailyReportSchema.index({ date: -1 });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
