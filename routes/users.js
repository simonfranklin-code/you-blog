const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureRole } = require('../middleware/roleMiddleware');
// Register
router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

// Login
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);

// Logout
router.get('/logout', userController.logout);

// Profile
router.get('/profile', userController.profileGet);

// Admin route example
router.get('/admin', ensureAuthenticated, ensureRole('admin'), (req, res) => {
    res.send('Admin Dashboard');
});

// Password Reset Request
router.get('/password-reset-request', userController.passwordResetRequestGet);
router.post('/password-reset-request', userController.passwordResetRequestPost);

// Password Reset
router.get('/password-reset/:token', userController.passwordResetGet);
router.post('/password-reset/:token', userController.passwordResetPost);



module.exports = router;