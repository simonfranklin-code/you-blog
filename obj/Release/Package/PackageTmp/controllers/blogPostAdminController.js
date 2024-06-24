const BlogPost = require('../models/BlogPost');
const Blog = require('../models/Blog');

exports.getBlogPostsPage = (req, res) => {
    res.render('admin/blogPosts');
};

exports.getBlogPosts = async (req, res) => {
    const filters = {};
    const { page = 1, limit = 10, sortField = 'CreatedAt', sortOrder = 'DESC', title, author, blogId } = req.query;
    const blogs = await Blog.getAll(1, 1000, 'BlogId', 'DESC', {})
    const blogPosts = await BlogPost.getAll(page, parseInt(limit), sortField, sortOrder, { title, author, blogId });
    const totalBlogPosts = await BlogPost.getBlogPostsCount({ title });
    const totalPages = Math.ceil(totalBlogPosts / limit);
    res.json({ blogs, blogPosts, totalPages, totalBlogPosts });
};

exports.createBlogPost = async (req, res) => {
    const { title, content, blogId, author, userId } = req.body;
    await BlogPost.add(title, content, blogId, author, userId);
    res.json({ success: true });
};

exports.editBlogPost = async (req, res) => {
    const { title, slug, blogId, author, userId, createdAt } = req.body;
    await BlogPost.edit(req.params.id, title, slug, blogId, author, userId, createdAt);
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
