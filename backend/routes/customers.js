const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// ─── GET all customers ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { search, active } = req.query;
    let query = {};
    
    if (active !== undefined) {
      query.isActive = active === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    const customers = await Customer.find(query).sort({ name: 1 });
    res.json({ success: true, data: customers, count: customers.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET single customer ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST create customer ─────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { name, phone, address, location, pricePerNormalCan, pricePerCoolCan, notes } = req.body;
    
    const customer = new Customer({
      name,
      phone,
      address,
      location: location || { latitude: null, longitude: null },
      pricePerNormalCan: pricePerNormalCan || 20,
      pricePerCoolCan: pricePerCoolCan || 30,
      notes: notes || ''
    });
    
    await customer.save();
    res.status(201).json({ success: true, data: customer, message: 'Customer added successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT update customer ──────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    
    const allowedUpdates = [
      'name', 'phone', 'address', 'location', 
      'pricePerNormalCan', 'pricePerCoolCan', 'notes', 'isActive',
      'normalCansBalance', 'coolCansBalance', 'emptyCansBalance'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        customer[field] = req.body[field];
      }
    });
    
    await customer.save();
    res.json({ success: true, data: customer, message: 'Customer updated successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── PUT update customer location ─────────────────────
router.put('/:id/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { location: { latitude, longitude } },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer, message: 'Location updated' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─── DELETE customer (soft delete) ────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deactivated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── DELETE customer (hard delete) ────────────────────
router.delete('/:id/permanent', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET customer delivery history ────────────────────
router.get('/:id/history', async (req, res) => {
  try {
    const Delivery = require('../models/Delivery');
    const deliveries = await Delivery.find({
      'trips.deliveries.customerId': req.params.id
    }).sort({ date: -1 }).limit(30);
    
    // Extract relevant delivery entries for this customer
    const history = [];
    deliveries.forEach(d => {
      d.trips.forEach(trip => {
        trip.deliveries.forEach(del => {
          if (del.customerId.toString() === req.params.id && del.status === 'delivered') {
            history.push({
              date: d.dateString,
              tripNumber: trip.tripNumber,
              normalCans: del.normalCansDelivered,
              coolCans: del.coolCansDelivered,
              emptyCollected: del.emptyNormalCansCollected + del.emptyCoolCansCollected,
              deliveredAt: del.deliveredAt
            });
          }
        });
      });
    });
    
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
