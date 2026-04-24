const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const Customer = require('../models/Customer');

// ─── GET billing for a customer (all months) ──────────
router.get('/customer/:customerId', async (req, res) => {
  try {
    const bills = await Billing.find({ customerId: req.params.customerId })
      .sort({ year: -1, month: -1 });
    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET billing for current month (all customers) ───
router.get('/current-month', async (req, res) => {
  try {
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const bills = await Billing.find({ monthKey }).sort({ customerName: 1 });
    
    const summary = {
      totalBilled: bills.reduce((sum, b) => sum + b.totalAmount, 0),
      totalPaid: bills.reduce((sum, b) => sum + b.paidAmount, 0),
      totalPending: bills.reduce((sum, b) => sum + b.pendingAmount, 0),
      totalCustomers: bills.length,
      cleared: bills.filter(b => b.status === 'cleared').length,
      partial: bills.filter(b => b.status === 'partial').length,
      pending: bills.filter(b => b.status === 'pending').length
    };
    
    res.json({ success: true, data: bills, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET billing for specific month ──────────────────
router.get('/month/:monthKey', async (req, res) => {
  try {
    const bills = await Billing.find({ monthKey: req.params.monthKey })
      .sort({ customerName: 1 });
    
    const summary = {
      totalBilled: bills.reduce((sum, b) => sum + b.totalAmount, 0),
      totalPaid: bills.reduce((sum, b) => sum + b.paidAmount, 0),
      totalPending: bills.reduce((sum, b) => sum + b.pendingAmount, 0),
      totalCustomers: bills.length
    };
    
    res.json({ success: true, data: bills, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST add payment ─────────────────────────────────
router.post('/payment', async (req, res) => {
  try {
    const { customerId, amount, mode, note, monthKey } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid amount required' });
    }
    
    // Find or determine the monthKey
    const targetMonthKey = monthKey || 
      `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    
    let billing = await Billing.findOne({ customerId, monthKey: targetMonthKey });
    if (!billing) {
      // If no billing record, create one
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      const [year, month] = targetMonthKey.split('-').map(Number);
      billing = new Billing({
        customerId,
        customerName: customer.name,
        month,
        year,
        monthKey: targetMonthKey,
        normalCanRate: customer.pricePerNormalCan,
        coolCanRate: customer.pricePerCoolCan
      });
    }
    
    billing.payments.push({
      amount,
      date: new Date(),
      mode: mode || 'cash',
      note: note || ''
    });
    
    await billing.save(); // pre-save hook auto-calculates amounts & status
    
    // Update customer's total paid amount
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.totalPaidAmount += amount;
      await customer.save();
    }
    
    res.json({ 
      success: true, 
      data: billing, 
      message: `₹${amount} payment recorded ✅` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET billing summary for all customers ────────────
router.get('/summary', async (req, res) => {
  try {
    const customers = await Customer.find({ isActive: true })
      .select('name phone totalBillAmount totalPaidAmount pendingAmount')
      .sort({ name: 1 });
    
    const totalBilled = customers.reduce((sum, c) => sum + c.totalBillAmount, 0);
    const totalPaid = customers.reduce((sum, c) => sum + c.totalPaidAmount, 0);
    const totalPending = customers.reduce((sum, c) => sum + c.pendingAmount, 0);
    
    res.json({
      success: true,
      data: customers,
      summary: { totalBilled, totalPaid, totalPending, totalCustomers: customers.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
