const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.dashboard = (req, res) => {
    res.render('admin/dashboard');
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin/users', { users });
    } catch (err) {
        req.flash('error_msg', 'Error retrieving users');
        res.redirect('/admin/dashboard');
    }
};

exports.getUsersJSON = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const filters = {
        username: req.query.username || null,
        email: req.query.email || null,
        role: req.query.role || null,
        keyword: req.query.keyword || null
    };
    const sort = {
        field: req.query.sortField || 'id',
        order: req.query.sortOrder || 'ASC'
    };

    try {
        const users = await User.findAll({ page, limit, filters, sort });
        const totalUsers = await User.countAll({ filters });
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({ users, page, totalPages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.editUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, role } = req.body;
    try {
        await User.update(id, { username, email, role });
        await ActivityLog.log(req.user.id, 'Edited user', 'User', id, `Updated username to ${username}, email to ${email}, role to ${role}`);
        req.flash('success_msg', 'User updated successfully');
        res.redirect('/admin/users');
    } catch (err) {
        req.flash('error_msg', 'Error updating user');
        res.redirect('/admin/users');
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await User.delete(id);
        await ActivityLog.log(req.user.id, 'Deleted user', 'User', id);
        req.flash('success_msg', 'User deleted successfully');
        res.redirect('/admin/users');
    } catch (err) {
        req.flash('error_msg', 'Error deleting user');
        res.redirect('/admin/users');
    }
};

exports.getActivityLogs = (req, res) => {
    res.render('admin/activity-logs', { filters: {}, sort: {} });
};

exports.getActivityLogsJSON = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const filters = {
        userId: req.query.userId || null,
        action: req.query.action || null,
        entityType: req.query.entityType || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
        keyword: req.query.keyword || null
    };
    const sort = {
        field: req.query.sortField || 'timestamp',
        order: req.query.sortOrder || 'DESC'
    };

    try {
        const logs = await ActivityLog.findAll({ page, limit, filters, sort });
        const totalLogs = await ActivityLog.countAll({ filters });
        const totalPages = Math.ceil(totalLogs / limit);

        res.json({ logs, page, totalPages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

