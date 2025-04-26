const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.js");
const User = require('../models/user.model.js');

const user = new User();

router.post('/login', user.login);
//router.post('/refresh_token', verifyJwt , user.refreshToken)

router.post('/verify_token', (req, res) => {
    const userSession = req.session?.user;
    if (userSession) {
        return res.json({
            operation: 'success',
            message: 'User already logged in',
            user: userSession
        });
    } else {
        return res.json({
            operation: 'failed',
            message: 'No valid session found'
        });
    }
});

//router.post('/get_permission', user.getPermission)
router.get('/logout', user.logout);

router.post('/get_employees',  user.getEmployees);
router.post('/add_employee',  user.addEmployee);
router.post('/delete_employee', user.deleteEmployee);
router.post('/update_employee', user.updateEmployee);

router.post('/get_profile', user.getProfile);
router.post('/update_profile', upload("/profile_images").single("file"), user.updateProfile);
router.post('/update_profile_password', user.updateProfilePassword);

module.exports = router;