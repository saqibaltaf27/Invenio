const express = require("express");
const router = express.Router();

const goodsReceiveController = require('../models/goodsReceive.model.js'); 
const Supplier = require('../models/suppliers.model.js');
const Product = require('../models/products.model.js');
const { isAuthenticated } = require('../middlewares/authMiddleware');

const product = new Product();
const supplier = new Supplier();

router.post('/get_suppliers', isAuthenticated, (req, res) => supplier.getSuppliers(req, res));
router.post('/get_products', isAuthenticated, (req, res) => product.getProducts(req, res));

// Goods Receive Routes
router.post('/goods_receives',  (req, res) => goodsReceiveController.createGoodsReceive(req, res));
router.get('/goods_receives/:gr_id/invoice', (req, res) => goodsReceiveController.generateGRInvoice(req, res));
router.post('/get_goods_receives',  (req, res) => goodsReceiveController.getAllGoodsReceives(req, res));
router.post('/get_goods_receive_details',  (req, res) => goodsReceiveController.getGoodsReceiveDetails(req, res));



module.exports = router;