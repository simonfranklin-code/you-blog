const Follower = require('../models/Follower');
const Notification = require('../models/Notification');

exports.followUser = async (req, res) => {
    const { UserId } = req.body;
    const FollowerUserId = req.user.id;  // Assume req.user contains the authenticated user's information

    try {
        await Follower.followUser(UserId, FollowerUserId);
        await Notification.createNotification(UserId, `You have a new follower.`);
        res.json({ success: true, message: 'User followed' });
    } catch (err) {
        Follower.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.unfollowUser = async (req, res) => {
    const { UserId } = req.body;
    const FollowerUserId = req.user.id;  // Assume req.user contains the authenticated user's information

    try {
        await Follower.unfollowUser(UserId, FollowerUserId);
        res.json({ success: true, message: 'User unfollowed' });
    } catch (err) {
        Follower.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getFollowers = async (req, res) => {
    const UserId = req.user.id;  // Assume req.user contains the authenticated user's information

    try {
        const followers = await Follower.getFollowers(UserId);
        res.json({ success: true, followers });
    } catch (err) {
        Follower.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getFollowing = async (req, res) => {
    const UserId = req.user.id;  // Assume req.user contains the authenticated user's information

    try {
        const following = await Follower.getFollowing(UserId);
        res.json({ success: true, following });
    } catch (err) {
        Follower.logError(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
