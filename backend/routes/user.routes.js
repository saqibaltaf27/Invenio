const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.js");
const User = require('../models/user.model.js');
const { isAuthenticated } = require('../middlewares/authMiddleware.js');

const user = new User();

router.post('/login', (req, res) => user.login(req, res));
router.get('/logout', (req, res) => user.logout(req, res));

router.post('/get_employees', isAuthenticated, (req, res) => user.getEmployees(req, res));
router.post('/add_employee', isAuthenticated, (req, res) => user.addEmployee(req, res));
router.post('/delete_employee', isAuthenticated, (req, res) => user.deleteEmployee(req, res));
router.post('/update_employee', isAuthenticated, (req, res) => user.updateEmployee(req, res));

router.post('/get_profile', isAuthenticated, (req, res) => user.getProfile(req, res));
router.post('/update_profile', upload("/profile_images").single("file"), isAuthenticated, (req, res) => user.updateProfile (req, res));
router.post('/update_profile_password', isAuthenticated, (req, res) => user.updateProfilePassword(req, res));

module.exports = router;