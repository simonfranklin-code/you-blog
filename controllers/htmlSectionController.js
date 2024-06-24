const HtmlSection = require('../models/HtmlSection');
const BlogPost = require('../models/BlogPost');
const db = require('../models/db');
var path = require('path');
const fs = require('fs');

exports.getHtmlSectionsPage = (req, res) => {
    res.render('admin/htmlSections');
};

exports.getHtmlSections = async (req, res) => {
    const filters = {};
    const { page = 1, limit = 5, sortField = 'DateCreated', sortOrder = 'DESC', anchor, blogPostId } = req.query;
    const htmlSections = await HtmlSection.getAll(page, parseInt(limit), sortField, sortOrder, { anchor, blogPostId });
    const totalHtmlSections = await HtmlSection.getHtmlSectionsCount({ blogPostId });
    const totalPages = Math.ceil(totalHtmlSections / limit);
    const blogPosts = await BlogPost.getAll(1, parseInt(100), 'BlogPostId', 'ASC', filters);
    res.json({ htmlSections, totalPages, totalHtmlSections, blogPosts });
};

exports.createHtmlSection = async (req, res) => {
    const { html, blogPostId, viewIndex, anchor, slug } = req.body;
    await HtmlSection.add(html, blogPostId, viewIndex, anchor, slug);
    res.json({ success: true });
};

exports.editHtmlSection = async (req, res) => {
    const { html, viewIndex, anchor, slug } = req.body;
    await HtmlSection.edit(req.params.id, html, viewIndex, anchor, slug);
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
            res.json({ success: false });
        } else {
            res.json({ success: true });
        }
    });
};

exports.updateHtmlSectionByHtmlSectionId = (req, res) => {
    const { BlogPostId, HtmlSectionID, Html } = req.body;

    db.run(`UPDATE HtmlSections SET Html = ?, DateUpdated = ? WHERE HtmlSectionID = ? AND BlogPostId = ?`, [Html, new Date().toISOString(), HtmlSectionID, BlogPostId], function (err) {
        if (err) {
            console.error(err);
            res.json({ success: false });
        } else {
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
        const url = 'http://localhost:8080/' + slug + '.html';
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
        const url = 'http://localhost:8080/' + slug + '.html';
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