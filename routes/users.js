const express = require('express');
const router = express.Router();
const userblogController = require('../controllers/userblogController');
const userBlogPostController = require('../controllers/userBlogPostController');
const userController = require('../controllers/userController');
const userHtmlSectionController = require('../controllers/userHtmlSectionController');
const { ensureAuthenticated, ensureRole, ensureRoles, ensurePermission } = require('../middleware/permissionMiddleware');

// Register
router.get('/register', userController.registerGet);
router.post('/register', userController.registerPost);

// Login
router.get('/login', userController.loginGet);
router.post('/login', userController.loginPost);
// Logout
router.get('/logout', userController.logout);

// Route to get user profile
router.get('/profile', ensureAuthenticated, userController.getUserProfile);

// Admin route example
router.get('/admin', ensureAuthenticated, ensureRole('admin'), (req, res) => {
    res.send('Admin Dashboard');
});

// Password Reset Request
router.get('/password-reset-request', userController.passwordResetRequestGet);
router.post('/password-reset-request', userController.passwordResetRequestPost);

// Password Reset
router.get('/password-reset/:token', userController.passwordResetGet);
router.post('/password-reset/:token', userController.passwordResetPost);

// Admin Dashboard
router.get('/dashboard', ensureAuthenticated, userController.userDashboard);
// Manage Blogs
router.get('/blogs', ensureAuthenticated, ensurePermission('manage_blogs'), userblogController.getBlogsPage);
router.get('/blogs/api', ensureAuthenticated, ensurePermission('view_blogs'), userblogController.getBlogs);
router.post('/blogs/create', ensureAuthenticated, ensurePermission('add_blogs'), userblogController.createBlog);
router.post('/blogs/edit/:id', ensureAuthenticated, ensurePermission('edit_blogs'), userblogController.editBlog);
router.post('/blogs/delete/:id', ensureAuthenticated, ensurePermission('delete_blogs'), userblogController.deleteBlog);
router.get('/blogs/:id', ensureAuthenticated, ensurePermission('view_blogs'), userblogController.getBlog);

// Manage Blog Posts
router.get('/blogPosts', ensureAuthenticated, ensurePermission('manage_blogPosts'), userBlogPostController.getBlogPostsPage);
router.get('/blogPosts/api', ensureAuthenticated, ensurePermission('view_blogPosts'), userBlogPostController.getBlogPosts);
router.post('/blogPosts/create', ensureAuthenticated, ensurePermission('add_blogPosts'), userBlogPostController.createBlogPost);
router.post('/blogPosts/edit/:id', ensureAuthenticated, ensurePermission('edit_blogPosts'), userBlogPostController.editBlogPost);
router.post('/blogPosts/delete/:id', ensureAuthenticated, ensurePermission('delete_blogPosts'), userBlogPostController.deleteBlogPost);
router.get('/blogPosts/:id', ensureAuthenticated, ensurePermission('view_blogPosts'), userBlogPostController.getBlogPost);
router.post('/blogPosts/uploadHtmlFile', ensureAuthenticated, ensurePermission('add_blogPosts'), userBlogPostController.uploadHtmlFile);

// Manage HTML Sections

router.get('/htmlSections', ensureAuthenticated, ensurePermission('manage_htmlSections'), userHtmlSectionController.getHtmlSectionsPage);
router.get('/htmlSections/api', ensureAuthenticated, ensurePermission('view_htmlSections'), userHtmlSectionController.getHtmlSections);
router.post('/htmlSections/create', ensureAuthenticated, ensurePermission('add_htmlSections'), userHtmlSectionController.createHtmlSection);
router.post('/htmlSections/edit/:id', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.editHtmlSection);
router.post('/htmlSections/delete/:id', ensureAuthenticated, ensurePermission('delete_htmlSections'), userHtmlSectionController.deleteHtmlSection);
router.get('/htmlSections/:id', ensureAuthenticated, ensurePermission('view_htmlSections'), userHtmlSectionController.getHtmlSection);
router.post('/htmlSections/update', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.updateHtmlSection);
router.post('/htmlSections/updateBySectionId', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.updateHtmlSectionByHtmlSectionId);
router.post('/htmlSections/uploadImage', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.uploadImage);
router.get('/htmlSections/importHtml/:slug/:id', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.importHtml);
router.get('/htmlSections/importSingleHtmlSectionById/:slug/:anchor', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.importSingleHtmlSectionById);
router.post('/htmlSections/findAndReplace', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.findAndReplace);
// Route to retrieve blog Post Anchor
router.get('/htmlSections/getIframeSrc/:blogSlug/:blogPostSlug/:anchor', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.getIframeSrc);
router.get('/htmlSections/:blogSlug/:slug/:anchor', ensureAuthenticated, ensurePermission('edit_htmlSections'), userHtmlSectionController.getBlogPostSectionByAnchor);
router.get('/mobirise', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./public/ublog/project.mobirise', 'utf-8'));
    res.render('admin/mobirise', { title: 'You-Blog CMS', mobiriseData: data, hljs: hljs });
});




module.exports = router;