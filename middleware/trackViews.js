const BlogPostView = require('../models/BlogPostView');

module.exports = async function trackViews(req, res, next) {
    const url = req.baseUrl;
    const slug = url.split('/')[1];
    if (req.user && slug) {
        const  UserId = req.user.id;
        try {
            const blogPostId = await BlogPostView.getBlogPostIdBySlug(slug);
            if (blogPostId) {
                await BlogPostView.addView({ BlogPostId: blogPostId, UserId });
            }
        } catch (err) {
            console.error('Error tracking blog post view:', err);
        }
    }
    next();
};
