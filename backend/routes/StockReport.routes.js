const express = require('express');
const router = express.Router();
const { getStockReport } = require('../models/StockReport.model');

router.get('/stock-report', getStockReport);

module.exports = router;
