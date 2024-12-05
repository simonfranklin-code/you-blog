// controllers/friendController.js
const friendModel = require('../models/Friend');
const friendRequestModel = require('../models/FriendRequest');
const User = require('../models/User');
module.exports = {


    listFriends: async (req, res) => {
        const userId = req.user.id; // Assuming user is authenticated and req.user exists
        try {
            const friends = await friendModel.getFriends(userId);
            res.render('admin/friends', { friends });
        } catch (error) {
            res.status(500).send('Error retrieving friends');
        }
    },

    sendFriendRequest: async (req, res) => {
        const requesterId = req.user.id;
        const receiverId = req.body.receiverId;
        try {
            await friendRequestModel.createFriendRequest(requesterId, receiverId);
            res.json({success: true});
        } catch (error) {
            res.status(500).send('Error sending friend request');
        }
    },

    viewPendingRequests: async (req, res) => {
        const userId = req.user.id;
        try {
            const pendingRequests = await friendRequestModel.getPendingRequests(userId);
            res.render('pendingRequests', { pendingRequests });
        } catch (error) {
            res.status(500).send('Error retrieving pending requests');
        }
    },

    acceptRequest: async (req, res) => {
        const requestId = req.body.requestId;
        const userId = req.body.userId;
        try {

            await friendRequestModel.respondToRequest(requestId, 'accepted');
            const req = await friendRequestModel.findByRequestId(requestId);
            await friendModel.addFriend(userId, req.requester_id);
            res.redirect('/friends/friendsDashboard');
        } catch (error) {
            res.status(500).send('Error accepting request');
        }
    },

    declineRequest: async (req, res) => {
        const requestId = req.body.requestId;
        try {
            await friendRequestModel.respondToRequest(requestId, 'declined');
            res.redirect('/friends/friendsDashboard');
        } catch (error) {
            res.status(500).send('Error declining request');
        }
    },

    friendsDashboard: async (req, res) => {
        try {
            // Render the 'admin/friends' Pug template
            const friends = await friendModel.getFriends(req.user.id);
            const pendingRequests = await friendRequestModel.getPendingRequests(req.user.id);

            res.render(`${req.user.role === 'admin' ? 'admin' : 'user'}/friends`, {
                title: 'Friends Management',
                user: req.user, // Pass user information if needed
                friends: friends,
                pendingRequests: pendingRequests,
            });
        } catch (error) {
            console.error('Error rendering the friends dashboard:', error);
            res.status(500).send('Internal Server Error');
        }
    },

    searchUsers: async (req, res) => {
        const { search } = req.body;
        try {
            // Find users by partial match on username or email
            const users = await User.searchByUsernameOrEmail(search);

            // Send the list of matched users back as JSON for the frontend to handle
            res.json({ users });
        } catch (error) {
            res.status(500).json({ error: 'Error searching for users' });
        }
    }
};
