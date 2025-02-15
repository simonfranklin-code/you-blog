module.exports.ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/users/login');
};

module.exports.ensureRole = (role) => {
    return (req, res, next) => {
        if (req.user.role === role) {
            return next();
        }
        req.flash('error_msg', 'You do not have permission to view that resource');
        res.redirect('/');
    };
};
