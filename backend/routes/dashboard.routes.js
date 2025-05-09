const express = require("express");
const router = express.Router();

const Dashboard = require('../models/dashboard.model.js');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const dashboard = new Dashboard();

router.post('/get_report_stats',(req, res) => {
    dashboard.getReportStats(req, res);
  });
  
  router.post('/get_product_stats', (req, res) => {
    dashboard.getProductStats(req, res);});

module.exports = router;