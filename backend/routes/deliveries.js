const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Customer = require('../models/Customer');
const Billing = require('../models/Billing');

// ─── GET today's delivery ─────────────────────────────
router.get('/today', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const delivery = await Delivery.findOne({ dateString: today });
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET delivery by date ─────────────────────────────
router.get('/date/:date', async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ dateString: req.params.date });
    res.json({ success: true, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST start new delivery day ──────────────────────
router.post('/start', async (req, res) => {
  try {
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    // Check if delivery already exists for today
    let delivery = await Delivery.findOne({ dateString });
    if (delivery && delivery.status === 'completed') {
      return res.status(400).json({ 
        success: false, 
        message: 'Aaj ki delivery already complete ho chuki hai' 
      });
    }
    
    if (delivery) {
      return res.json({ success: true, data: delivery, message: 'Existing delivery found' });
    }
    
    delivery = new Delivery({
      date: today,
      dateString,
      status: 'loading',
      trips: [],
      currentTripNumber: 1
    });
    
    await delivery.save();
    res.status(201).json({ success: true, data: delivery, message: 'New delivery day started' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST start a trip ────────────────────────────────
router.post('/trip/start', async (req, res) => {
  try {
    const { deliveryId, normalCansLoaded, coolCansLoaded, customerIds } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    // Fetch selected customers
    const customers = await Customer.find({ _id: { $in: customerIds }, isActive: true });
    
    const tripNumber = delivery.trips.length + 1;
    const tripDeliveries = customers.map(c => ({
      customerId: c._id,
      customerName: c.name,
      customerPhone: c.phone,
      normalCansDelivered: 0,
      coolCansDelivered: 0,
      emptyNormalCansCollected: 0,
      emptyCoolCansCollected: 0,
      deliveredAt: null,
      status: 'pending'
    }));
    
    const trip = {
      tripNumber,
      normalCansLoaded: normalCansLoaded || 0,
      coolCansLoaded: coolCansLoaded || 0,
      normalCansRemaining: normalCansLoaded || 0,
      coolCansRemaining: coolCansLoaded || 0,
      normalCansDelivered: 0,
      coolCansDelivered: 0,
      startTime: new Date(),
      endTime: null,
      status: 'in_progress',
      deliveries: tripDeliveries
    };
    
    delivery.trips.push(trip);
    delivery.currentTripNumber = tripNumber;
    delivery.status = 'in_progress';
    if (!delivery.startTime) {
      delivery.startTime = new Date();
    }
    delivery.totalNormalCansLoaded += (normalCansLoaded || 0);
    delivery.totalCoolCansLoaded += (coolCansLoaded || 0);
    
    await delivery.save();
    res.json({ success: true, data: delivery, message: `Trip ${tripNumber} started` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT deliver to a customer ────────────────────────
router.put('/deliver', async (req, res) => {
  try {
    const { 
      deliveryId, tripNumber, customerId,
      normalCansDelivered, coolCansDelivered,
      emptyNormalCansCollected, emptyCoolCansCollected,
      notes
    } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    const trip = delivery.trips.find(t => t.tripNumber === tripNumber);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    // Check if enough cans available
    if (normalCansDelivered > trip.normalCansRemaining) {
      return res.status(400).json({ 
        success: false, 
        message: `Sirf ${trip.normalCansRemaining} normal cans bache hain` 
      });
    }
    if (coolCansDelivered > trip.coolCansRemaining) {
      return res.status(400).json({ 
        success: false, 
        message: `Sirf ${trip.coolCansRemaining} cool cans bache hain` 
      });
    }
    
    const customerDelivery = trip.deliveries.find(
      d => d.customerId.toString() === customerId
    );
    if (!customerDelivery) {
      return res.status(404).json({ success: false, message: 'Customer not found in this trip' });
    }
    
    // Update delivery
    customerDelivery.normalCansDelivered = normalCansDelivered || 0;
    customerDelivery.coolCansDelivered = coolCansDelivered || 0;
    customerDelivery.emptyNormalCansCollected = emptyNormalCansCollected || 0;
    customerDelivery.emptyCoolCansCollected = emptyCoolCansCollected || 0;
    customerDelivery.deliveredAt = new Date();
    customerDelivery.status = 'delivered';
    if (notes) customerDelivery.notes = notes;
    
    // Update trip remaining
    trip.normalCansRemaining -= (normalCansDelivered || 0);
    trip.coolCansRemaining -= (coolCansDelivered || 0);
    trip.normalCansDelivered += (normalCansDelivered || 0);
    trip.coolCansDelivered += (coolCansDelivered || 0);
    
    // Update delivery totals
    delivery.totalNormalCansDelivered += (normalCansDelivered || 0);
    delivery.totalCoolCansDelivered += (coolCansDelivered || 0);
    delivery.totalEmptyCansCollected += (emptyNormalCansCollected || 0) + (emptyCoolCansCollected || 0);
    
    await delivery.save();
    
    // ─── Auto-update customer & billing ─────────
    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.normalCansBalance += (normalCansDelivered || 0);
      customer.coolCansBalance += (coolCansDelivered || 0);
      customer.emptyCansBalance -= (emptyNormalCansCollected || 0) + (emptyCoolCansCollected || 0);
      customer.monthlyNormalCans += (normalCansDelivered || 0);
      customer.monthlyCoolCans += (coolCansDelivered || 0);
      
      // Auto-add to billing
      const billAmount = (normalCansDelivered || 0) * customer.pricePerNormalCan +
                          (coolCansDelivered || 0) * customer.pricePerCoolCan;
      customer.totalBillAmount += billAmount;
      await customer.save();
      
      // ─── Auto-update monthly billing record ───
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      let billing = await Billing.findOne({ customerId, monthKey });
      if (!billing) {
        billing = new Billing({
          customerId,
          customerName: customer.name,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          monthKey,
          normalCanRate: customer.pricePerNormalCan,
          coolCanRate: customer.pricePerCoolCan
        });
      }
      
      billing.normalCansDelivered += (normalCansDelivered || 0);
      billing.coolCansDelivered += (coolCansDelivered || 0);
      await billing.save();
    }
    
    res.json({ 
      success: true, 
      data: delivery, 
      message: `${customerDelivery.customerName} ko delivery ho gayi ✅` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT complete a trip ──────────────────────────────
router.put('/trip/complete', async (req, res) => {
  try {
    const { deliveryId, tripNumber } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    const trip = delivery.trips.find(t => t.tripNumber === tripNumber);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }
    
    trip.status = 'completed';
    trip.endTime = new Date();
    
    // Count customers served in this trip
    const customersServed = trip.deliveries.filter(d => d.status === 'delivered').length;
    delivery.totalCustomersServed += customersServed;
    
    await delivery.save();
    res.json({ 
      success: true, 
      data: delivery, 
      message: `Trip ${tripNumber} complete ✅` 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT end delivery day ─────────────────────────────
router.put('/end', async (req, res) => {
  try {
    const { deliveryId } = req.body;
    
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery not found' });
    }
    
    // Complete any in-progress trips
    delivery.trips.forEach(trip => {
      if (trip.status === 'in_progress') {
        trip.status = 'completed';
        trip.endTime = new Date();
      }
    });
    
    delivery.status = 'completed';
    delivery.endTime = new Date();
    
    // Recalculate total customers served
    let totalServed = 0;
    delivery.trips.forEach(trip => {
      trip.deliveries.forEach(d => {
        if (d.status === 'delivered') totalServed++;
      });
    });
    delivery.totalCustomersServed = totalServed;
    
    await delivery.save();
    
    // ─── Auto-generate daily report ─────────────
    const DailyReport = require('../models/DailyReport');
    
    const tripDetails = delivery.trips.map(trip => ({
      tripNumber: trip.tripNumber,
      normalCansLoaded: trip.normalCansLoaded,
      coolCansLoaded: trip.coolCansLoaded,
      normalCansDelivered: trip.normalCansDelivered,
      coolCansDelivered: trip.coolCansDelivered,
      customersServed: trip.deliveries.filter(d => d.status === 'delivered').length,
      startTime: trip.startTime,
      endTime: trip.endTime
    }));
    
    const deliveryDetails = [];
    delivery.trips.forEach(trip => {
      trip.deliveries.forEach(d => {
        if (d.status === 'delivered') {
          deliveryDetails.push({
            customerId: d.customerId,
            customerName: d.customerName,
            normalCans: d.normalCansDelivered,
            coolCans: d.coolCansDelivered,
            emptyCansCollected: d.emptyNormalCansCollected + d.emptyCoolCansCollected,
            deliveredAt: d.deliveredAt,
            tripNumber: trip.tripNumber
          });
        }
      });
    });
    
    await DailyReport.findOneAndUpdate(
      { dateString: delivery.dateString },
      {
        date: delivery.date,
        dateString: delivery.dateString,
        totalTrips: delivery.trips.length,
        totalCustomersServed: delivery.totalCustomersServed,
        totalNormalCansDelivered: delivery.totalNormalCansDelivered,
        totalCoolCansDelivered: delivery.totalCoolCansDelivered,
        totalCansDelivered: delivery.totalNormalCansDelivered + delivery.totalCoolCansDelivered,
        totalEmptyCansCollected: delivery.totalEmptyCansCollected,
        tripDetails,
        deliveryDetails,
        deliveryStartTime: delivery.startTime,
        deliveryEndTime: delivery.endTime
      },
      { upsert: true, new: true }
    );
    
    res.json({ 
      success: true, 
      data: delivery, 
      message: 'Delivery day complete! Report generated ✅' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
