const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { ensureAuthenticated } = require('../middleware/permissionMiddleware');

// Route to get notifications for a user
router.get('/getNotifications', ensureAuthenticated, notificationController.getNotifications);

// Route to mark a notification as read
router.post('/markAsRead', ensureAuthenticated, notificationController.markAsRead);

module.exports = router;
