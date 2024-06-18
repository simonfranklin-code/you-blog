const Blog = require('../models/Blog');

exports.getBlogsPage = (req, res) => {
    res.render('admin/blogs');
};

exports.getBlogs = async (req, res) => {
    const filters = {};
    const { page = 1, limit = 1, sortField = 'dateCreated', sortOrder = 'DESC', title, author } = req.query;
    const blogs = await Blog.getAll(page, parseInt(limit), sortField, sortOrder, { title, author });
    const totalBlogs = await Blog.getBlogsCount({ filters });
    const totalPages = Math.ceil(totalBlogs / limit);
    res.json({ blogs, totalPages, totalBlogs });
};

exports.createBlog = async (req, res) => {
    const { title, description, author } = req.body;
    await Blog.add(title, description, author);
    res.json({ success: true });
};

exports.editBlog = async (req, res) => {
    const { title, description } = req.body;
    await Blog.edit(req.params.id, title, description);
    res.json({ success: true });
};

exports.deleteBlog = async (req, res) => {
    await Blog.delete(req.params.id);
    res.json({ success: true });
};

exports.getBlog = async (req, res) => {
    const blog = await Blog.get(req.params.id);
    res.json(blog);
};
