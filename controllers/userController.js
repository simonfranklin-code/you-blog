const User = require('../models/User');
const PasswordResetToken = require('../models/PasswordResetToken');
const transporter = require('../config/nodemailer');
const ActivityLog = require('../models/ActivityLog');
const passport = require('passport');
const bcrypt = require('bcryptjs');
exports.registerGet = (req, res) => {
    res.render('register');
};

exports.registerPost = async (req, res) => {
    const { username, email, password, role } = req.body;
    let errors = [];

    if (!username || !email || !password) {
        errors.push({ msg: 'Please enter all fields' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        res.render('register', { errors, username, email, password });
    } else {
        try {
            await User.create(username, email, password, role);
            req.flash('success_msg', 'You are now registered and can log in');
            res.redirect('/users/login');
        } catch (err) {
            res.render('register', { errors: [{ msg: 'Email already exists' }], username, email, password });
        }
    }
};

exports.passwordResetRequestGet = (req, res) => {
    res.render('password-reset-request');
};

exports.passwordResetRequestPost = async (req, res) => {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
        return res.render('password-reset-request', { error: 'No account with that email address exists.' });
    }

    const token = await PasswordResetToken.create(email);

    const mailOptions = {
        to: email,
        from: 'simonfranklin80@gmail.com',
        subject: 'Password Reset',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/users/password-reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
    };

    transporter.sendMail(mailOptions, (err) => {
        if (err) {
            console.error('Error sending email:', err);
            return res.render('password-reset-request', { error: 'Error sending email. Please try again later.' });
        }
        req.flash('success_msg', 'An email has been sent to ' + email + ' with further instructions.');
        res.render('password-reset-request', { message: 'An email has been sent to ' + email + ' with further instructions.' });
    });
};

exports.passwordResetGet = (req, res) => {
    const { token } = req.params;
    res.render('password-reset', { token });
};

exports.passwordResetPost = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    let errors = [];

    if (!password) {
        errors.push({ msg: 'Please enter a new password' });
    }

    if (password.length < 6) {
        errors.push({ msg: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
        return res.render('password-reset', { errors, token });
    }

    const resetToken = await PasswordResetToken.findByToken(token);
    if (!resetToken) {
        return res.render('password-reset', { errors: [{ msg: 'Password reset token is invalid or has expired' }], token });
    }

    const user = await User.findByEmail(resetToken.email);
    if (!user) {
        return res.render('password-reset', { errors: [{ msg: 'No account with that email address exists' }], token });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await User.updatePassword(user.email, user.password);
    await PasswordResetToken.deleteByEmail(resetToken.email);
    req.flash('success_msg', 'Password has been successfully reset. You can now log in with your new password.');
    res.render('password-reset', { message: 'Password has been successfully reset. You can now log in with your new password.' });
};

exports.loginGet = (req, res) => {
    res.render('login');
};

exports.loginPost = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/users/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, async () => {
        await ActivityLog.log(req.user.id, 'Logged in');
        next();
    });
};

exports.profileGet = (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error_msg', 'Please log in to view this resource');
        return res.redirect('/users/login');
    }
    res.render('profile', { user: req.user });
};

exports.logout = (req, res) => {
    const userId = req.user.id;
    req.logout(err => {
        if (err) {
            return next(err);
        }
        ActivityLog.log(userId, 'Logged out');
        req.flash('success_msg', 'You are logged out');
        res.redirect('/users/login');
    });
};
