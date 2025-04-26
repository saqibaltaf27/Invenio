const express = require("express");
const router = express.Router();

const Dashboard = require('../models/dashboard.model.js');

const dashboard = new Dashboard();

router.get('/auth/check', (req, res) => {
    if (req.session.user) {
      res.status(200).json({ authenticated: true, user: req.session.user });
    } else {
      res.status(401).json({ authenticated: false });
    }
  });

router.post('/get_report_stats', (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    dashboard.getReportStats(req, res);
  });

router.post('/get_product_stats', (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  dashboard.getProductStats(req, res);
});

router.post('/get_graph_stats', (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    dashboard.getGraphStats(req, res);
  });

module.exports = router;