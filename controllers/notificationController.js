const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    const UserId = req.user.id;  // Assume req.user contains the authenticated user's information

    try {
        const notifications = await Notification.getNotifications(UserId);
        res.json({ success: true, notifications });
    } catch (err) {
        Notification.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.markAsRead = async (req, res) => {
    const { NotificationId } = req.body;

    try {
        const changes = await Notification.markAsRead(NotificationId);
        if (changes > 0) {
            res.json({ success: true, message: 'Notification marked as read' });
        } else {
            res.status(404).json({ success: false, message: 'Notification not found' });
        }
    } catch (err) {
        Notification.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
