const Permission = require('../models/Permission');

exports.getPermissions = async (req, res) => {
    try {
        const roles = await Permission.getRoles();
        let page = 1;
        /*const permissions = await Permission.getPermissions(page);*/
        const permissionsLookup = await Permission.getPermissionsLookup();
        res.render('admin/permissions', { roles/*, permissions*/, permissionsLookup });
    } catch (err) {
        Permission.logError(err);
        req.flash('error_msg', 'Error retrieving permissions');
        res.redirect('/admin/dashboard');
    }
};

exports.createPermissionJSON = async (req, res) => {
    const { name } = req.body;
    try {
        await Permission.createPermission(name);
        req.flash('success_msg', 'Permission created successfully');
        res.json({ message: 'Permission created successfully', isError: false});
    } catch (err) {
        Permission.logError(err);
        req.flash('error_msg', 'Error creating permission');
        res.json({ message: 'Error creating permission', isError: true});
    }
};

exports.createPermission = async (req, res) => {
    const { name } = req.body;
    try {
        await Permission.createPermission(name);
        req.flash('success_msg', 'Permission created successfully');
        res.redirect('/admin/permissions');
    } catch (err) {
        Permission.logError(err);
        req.flash('error_msg', 'Error creating permission');
        res.redirect('/admin/permissions');
    }
};

exports.assignPermission = async (req, res) => {
    const { role, permissionName } = req.body;
    try {
        await Permission.assignPermissionToRole(role, permissionName);
        req.flash('success_msg', 'Permission assigned successfully');
        res.redirect('/admin/permissions');
    } catch (err) {
        Permission.logError(err);
        req.flash('error_msg', 'Error assigning permission');
        res.redirect('/admin/permissions');
    }
};

exports.getRolePermissions = async (req, res) => {
    try {
        const { page, limit, sortField, sortOrder, role, permission } = req.query;
        const filter = { role, permission };
        const rolePermissions = await Permission.getRolePermissions({ page, limit, sortField, sortOrder, filter });
        const totalRolePermissions = await Permission.getRolePermissionsCount(filter);
        const totalPages = Math.ceil(totalRolePermissions / limit);
        res.json({ rolePermissions, totalRolePermissions, page, totalPages });
    } catch (err) {
        Permission.logError(err);
        res.status(500).json({ error: 'Error retrieving role permissions' });
    }
};

exports.getFilteredPermissions = async (req, res) => {
    try {
        const { page, limit, sortField, sortOrder, name } = req.query;
        const filter = { name };
        const permissions = await Permission.getPermissions({ page, limit, sortField, sortOrder, filter });
        const totalPermissions = await Permission.getPermissionsCount(filter);
        const totalPages = Math.ceil(totalPermissions / limit);
        res.json({ permissions, page, totalPages, totalPermissions });
    } catch (err) {
        Permission.logError(err);
        res.status(500).json({ error: 'Error retrieving permissions' });
    }
};





