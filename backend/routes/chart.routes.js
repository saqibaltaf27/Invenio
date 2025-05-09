const express = require('express');
const router = express.Router();
const { getProductChart, getSupplierChart } = require('../models/chart.model.js');

router.get('/productsChart', getProductChart);
router.get('/suppliersChart', getSupplierChart);

module.exports = router;
