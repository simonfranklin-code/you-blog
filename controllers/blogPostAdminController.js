const BlogPost = require('../models/BlogPost');
const Blog = require('../models/Blog');
const User = require('../models/User');
const HtmlSection = require('../models/HtmlSection');
var path = require('path');
const fs = require('fs');

exports.getBlogPostsPage = async (req, res) => {
    const usersLookup = await User.findAll();
    const blogsLookup = await Blog.getAll(1, 1000, 'BlogId', 'ASC', {})
    res.render('admin/blogPosts', { users: usersLookup, blogs: blogsLookup });
};

exports.getBlogPosts = async (req, res) => {
    const filters = {};
    const { page = 1, limit = 10, sortField = 'Id', sortOrder = 'ASC', title, author, blogId } = req.query;
    const blogs = await Blog.getAll(1, 1000, 'BlogId', 'DESC', {})
    const blogPosts = await BlogPost.getAll(page, parseInt(limit), sortField, sortOrder, { title, author, blogId });
    const totalBlogPosts = await BlogPost.getBlogPostsCount({ title });
    const totalPages = Math.ceil(totalBlogPosts / limit);
    res.json({ blogs, blogPosts, totalPages, totalBlogPosts });
};

exports.createBlogPost = async (req, res) => {
    const { title, slug, blogId, author, userId, content } = req.body;
    await BlogPost.add(title, slug, blogId, author, userId, content);
    res.json({ success: true });
};

exports.editBlogPost = async (req, res) => {
    const { title, slug, blogId, author, userId, content } = req.body;
    await BlogPost.edit(req.params.id, title, slug, blogId, author, userId, content);
    res.json({ success: true });
};

exports.deleteBlogPost = async (req, res) => {
    await BlogPost.delete(req.params.id);
    res.json({ success: true });
};

exports.getBlogPost = async (req, res) => {
    const blogPost = await BlogPost.get(req.params.id);
    res.json(blogPost);
};

exports.uploadHtmlFile = (req, res) => {

    if (!req.files || !req.files.html) {
        return res.status(400).json({ success: false, message: 'No html file uploaded.' });
    }

    const htmlFile = req.files.html;
    const uploadDir = path.join(__dirname, '../public/uploads');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const htmlFilePath = path.join(uploadDir, htmlFile.name);

    htmlFile.mv(htmlFilePath, err => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Html file upload failed.' });
        }
        const url = 'http://localhost:8080/uploads/' + htmlFile.name;
        const slug = htmlFile.name.replace('.html', '').toLowerCase();
        
        const htmlSections = HtmlSection.importHtml(url, req.body.blogPostId, slug);


        res.json({ success: true });
    });




};