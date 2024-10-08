const HtmlSection = require('../models/HtmlSection');
const BlogPost = require('../models/BlogPost');
const db = require('../models/db');
const Notification = require('../models/Notification');
const Follower = require('../models/Follower');
const User = require('../models/User');
var path = require('path');
const fs = require('fs');


exports.getHtmlSectionsPage = (req, res) => {
    res.render('admin/htmlSections', {title: 'Html Sections'});
};

exports.getHtmlSections = async (req, res) => {
    const filters = {};
    const { page = 1, limit = 5, sortField = 'ViewIndex', sortOrder = 'ASC', anchor, blogPostId } = req.query;
    const htmlSections = await HtmlSection.getAll(page, parseInt(limit), sortField, sortOrder, { anchor, blogPostId });
    const totalHtmlSections = await HtmlSection.getHtmlSectionsCount({ blogPostId });
    const totalPages = Math.ceil(totalHtmlSections / limit);
    const blogPosts = await BlogPost.getAll(1, parseInt(100), 'BlogPostId', 'ASC', filters);
    res.json({ htmlSections, totalPages, totalHtmlSections, blogPosts });
};

exports.createHtmlSection = async (req, res) => {
    const { html, blogPostId, viewIndex, anchor, slug } = req.body;
    await HtmlSection.add(html, blogPostId, viewIndex, anchor, slug);
    await Notification.createNotification(req.user.id, `Html Section "${anchor}" has been created.`);
    // Notify followers
    const followers = await Follower.getFollowers(req.user.id);
    followers.forEach(async follower => {
        const username = req.user.username;
        await Notification.createNotification(follower.FollowerUserId, `User ${username} has created a new html section "${anchor}".`);
    });
    res.json({ success: true });
};

exports.editHtmlSection = async (req, res) => {
    const { html, viewIndex, anchor, slug } = req.body;
    await HtmlSection.edit(req.params.id, html, viewIndex, anchor, slug);
    req.flash('success_msg', 'Successfully updated HtmlSection');
    // Emit flash message to connected clients
    const flashMessage = req.flash('success_msg');
    req.io.emit('flash', { message: flashMessage, isError: false });
    await Notification.createNotification(req.user.id, `Html Section "${anchor}" has been edited.`);
    // Notify followers
    const followers = await Follower.getFollowers(req.user.id);
    followers.forEach(async follower => {
        const username = await User.findById(req.user.id).username;
        await Notification.createNotification(follower.FollowerUserId, `Html Section "${anchor}" has been edited.`);
    });
    res.json({ success: true });
};

exports.deleteHtmlSection = async (req, res) => {
    await HtmlSection.delete(req.params.id);
    res.json({ success: true });
};

exports.getHtmlSection = async (req, res) => {
    const htmlSection = await HtmlSection.get(req.params.id);
    res.json(htmlSection);
};

exports.updateHtmlSection = (req, res) => {
    const { HtmlSectionID, Html } = req.body;

    db.run(`UPDATE HtmlSections SET Html = ?, DateUpdated = ? WHERE HtmlSectionID = ?`, [Html, new Date().toISOString(), HtmlSectionID], function (err) {
        if (err) {
            console.error(err);
            HtmlSection.logError(err);
            req.flash('error_msg', 'Error updating HtmlSection');
            // Emit flash message to connected clients
            const flashMessage = req.flash('error_msg');
            req.io.emit('flash', { message: flashMessage, isError: true });
            res.json({ success: false });
        } else {
            req.flash('success_msg', 'Successfully updated HtmlSection');
            // Emit flash message to connected clients
            const flashMessage = req.flash('success_msg');
            req.io.emit('flash', { message: flashMessage, isError: false });
            res.json({ success: true });
        }
    });
};

exports.updateHtmlSectionByHtmlSectionId = (req, res) => {
    const { BlogPostId, HtmlSectionID, Html } = req.body;

    db.run(`UPDATE HtmlSections SET Html = ?, DateUpdated = ? WHERE HtmlSectionID = ? AND BlogPostId = ?`, [Html, new Date().toISOString(), HtmlSectionID, BlogPostId], function (err) {
        if (err) {
            console.error(err);
            HtmlSection.logError(err);
            req.flash('error_msg', 'Error updatng HtmlSection');
            // Emit flash message to connected clients
            const flashMessage = req.flash('error_msg');
            req.io.emit('flash', { message: flashMessage, isError: true });
            res.json({ success: false });
        } else {
            req.flash('success_msg', 'Successfully updated HtmlSection');
            // Emit flash message to connected clients
            const flashMessage = req.flash('success_msg');
            req.io.emit('flash', { message: flashMessage, isError: false });
            res.json({ success: true });
        }
    });
};

exports.uploadImage = (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ success: false, message: 'No image file uploaded.' });
    }

    const image = req.files.image;
    const uploadDir = path.join(__dirname, '../public/uploads');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const imagePath = path.join(uploadDir, image.name);

    image.mv(imagePath, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Image upload failed.' });
        }

        res.json({ success: true, imageUrl: `/uploads/${image.name}` });
    });
};

exports.importHtml = async (req, res) => {
    try {
        const slug = req.params.slug;
        const blogPostId = parseInt(req.params.id);
        const url = 'https://simonfranklin-code.github.io/' + slug + '.html';
        const htmlSections = await HtmlSection.importHtml(url, blogPostId);
        if (htmlSections === null || htmlSections === 'undefined') {
            throw new Error('importHtml failed');
        } else {
            res.json(htmlSections);
        }
    } catch (err) {
        res.json(err);
    }
};

exports.importSingleHtmlSectionById = async (req, res) => {
    try {
        const slug = req.params.slug;
        const anchor = req.params.anchor;
        const url = 'https://simonfranklin-code.github.io/' + slug + '.html';
        const htmlSections = await HtmlSection.importSingleHtmlSection(url, anchor);
        if (htmlSections === null || htmlSections === 'undefined') {
            throw new Error('importSingleHtmlSectionById failed');
        } else {
            res.json(htmlSections);
        }
    } catch (err) {
        res.json(err);
    }
};

exports.findAndReplace = async (req, res) => {
    try {
        let { find, replace, blogPostId } = req.body;
        let sql = '';
        // Enhanced validation
        if (find == null) {
            return res.status(400).json({ error: 'Missing required fields' });
        } else if (replace == null || replace == 'undefined') {
            replace = '';
        }
        if (blogPostId == null) {
            sql = `UPDATE HtmlSections SET Html = REPLACE(Html, ?, ?)`;
            db.run(sql, [find, replace], function (err) {
                if (err) {
                    console.error('Error executing SQL:', err.message);
                    return res.status(500).json({ error: 'An error occurred while updating the database' });
                }
                // Check the number of affected rows
                if (this.changes > 0) {
                    res.json({ success: true, message: `${this.changes} rows updated` });
                } else {
                    res.status(404).json({ success: false, message: 'No matching records found' });
                }
            });

        } else {
            sql = `UPDATE HtmlSections SET Html = REPLACE(Html, ?, ?) WHERE BlogPostId = ?`;
            db.run(sql, [find, replace, blogPostId], function (err) {
                if (err) {
                    console.error('Error executing SQL:', err.message);
                    return res.status(500).json({ error: 'An error occurred while updating the database' });
                }

                // Check the number of affected rows
                if (this.changes > 0) {
                    res.json({ success: true, message: `${this.changes} rows updated` });
                } else {
                    res.status(404).json({ success: false, message: 'No matching records found' });
                }
            });
        }



    } catch (err) {
        res.json(err);
    }
};


