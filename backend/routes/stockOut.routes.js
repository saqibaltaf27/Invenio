const express = require('express');
const router = express.Router();
const { getProductsWithStock, createStockOut, getStockOutLogs } = require('../models/stockOut.model');


router.get('/products-with-stock', async (req, res) => {
  try {
    const products = await getProductsWithStock();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/stock-out', async (req, res) => {
  const { customer_info, items } = req.body;
  try {
    const result = await createStockOut(customer_info, items);
    res.status(201).json({ message: 'Stock out successful', so_id: result.so_id });
  } catch (err) {
    console.error('Stock out error:', err);
    res.status(500).json({ message: 'Stock out failed', error: err.message });
  }
});

router.get('/stock-out-logs', async (req, res) => {
  try {
    const logs = await getStockOutLogs();
    res.json(logs);
  } catch (err) {
    console.error('Error fetching stock out logs:', err);
    res.status(500).json({ message: 'Failed to fetch stock out logs' });
  }
});



module.exports = router;
