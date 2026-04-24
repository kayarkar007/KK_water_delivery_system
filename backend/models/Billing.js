const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  mode: {
    type: String,
    enum: ['cash', 'upi', 'bank', 'other'],
    default: 'cash'
  },
  note: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
}, { _id: true });

const billingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: { type: String, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  monthKey: { type: String, required: true }, // "2026-04" for easy querying
  // Delivery counts
  normalCansDelivered: { type: Number, default: 0 },
  coolCansDelivered: { type: Number, default: 0 },
  // Rates
  normalCanRate: { type: Number, default: 20 },
  coolCanRate: { type: Number, default: 30 },
  // Amounts (auto-calculated)
  normalCansAmount: { type: Number, default: 0 },
  coolCansAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, default: 0 },
  // Payments
  payments: [paymentSchema],
  // Status
  status: {
    type: String,
    enum: ['pending', 'partial', 'cleared'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Auto-calculate amounts before save
billingSchema.pre('save', function(next) {
  this.normalCansAmount = this.normalCansDelivered * this.normalCanRate;
  this.coolCansAmount = this.coolCansDelivered * this.coolCanRate;
  this.totalAmount = this.normalCansAmount + this.coolCansAmount;

  // Calculate paid amount from payments
  this.paidAmount = this.payments.reduce((sum, p) => sum + p.amount, 0);
  this.pendingAmount = this.totalAmount - this.paidAmount;

  // Auto-update status
  if (this.pendingAmount <= 0) {
    this.status = 'cleared';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else {
    this.status = 'pending';
  }
  next();
});

// Compound index for unique billing per customer per month
billingSchema.index({ customerId: 1, monthKey: 1 }, { unique: true });
billingSchema.index({ monthKey: 1 });

module.exports = mongoose.model('Billing', billingSchema);
