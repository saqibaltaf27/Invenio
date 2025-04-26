const express = require("express");
const router = express.Router();


const Product = require('../models/products.model.js');
const upload = require("../middlewares/upload.js");
const { isAuthenticated } = require('../middlewares/authMiddleware');

const product = new Product();

router.post('/add_product', isAuthenticated, upload("/uploads").single("image"), (req, res) => product.addProduct(req, res));
router.post('/delete_product', isAuthenticated, (req, res) => product.deleteProduct(req, res));
router.post('/get_products', isAuthenticated, (req, res) => product.getProducts(req, res));
router.post('/get_products_search', isAuthenticated, (req, res) => product.getProductsSearch(req, res));
router.post('/get_products_details_by_id', isAuthenticated, (req, res) => product.getProductsDetailsById(req, res));
router.post('/update_product', isAuthenticated, upload("/uploads").single("image"), (req, res) => product.updateProduct(req, res));
router.post('/delete_product_image', isAuthenticated, (req, res) => product.deleteProductImage(req, res));

module.exports = router;