const express = require("express");
const router = express.Router();

const Supplier = require('../models/suppliers.model.js');
const { isAuthenticated } = require('../middlewares/authMiddleware.js');

const supplier = new Supplier();

router.post('/get_suppliers', (req, res) => supplier.getSuppliers(req, res))
router.post('/add_supplier', (req, res) => supplier.addSupplier(req, res))
router.post('/delete_supplier',  (req, res) => supplier.deleteSupplier(req, res))
router.post('/update_supplier',  (req, res) => supplier.updateSupplier(req, res))
router.post('/get_suppiers_search',  (req, res) => supplier.getSuppiersSearch(req, res))

module.exports = router;