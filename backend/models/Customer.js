const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  // Can balances at customer's place
  normalCansBalance: { type: Number, default: 0 },
  coolCansBalance: { type: Number, default: 0 },
  emptyCansBalance: { type: Number, default: 0 },
  // Monthly delivery tracking (resets each month)
  monthlyNormalCans: { type: Number, default: 0 },
  monthlyCoolCans: { type: Number, default: 0 },
  monthlyLastReset: { type: Date, default: Date.now },
  // Pricing (per customer, allows custom rates)
  pricePerNormalCan: { type: Number, default: 20 },
  pricePerCoolCan: { type: Number, default: 30 },
  // Billing summary
  totalBillAmount: { type: Number, default: 0 },
  totalPaidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  // Status
  isActive: { type: Boolean, default: true },
  // Notes
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// Auto-calculate pending amount before save
customerSchema.pre('save', function(next) {
  this.pendingAmount = this.totalBillAmount - this.totalPaidAmount;
  next();
});

// Index for search
customerSchema.index({ name: 'text', phone: 'text', address: 'text' });
customerSchema.index({ isActive: 1 });

module.exports = mongoose.model('Customer', customerSchema);
