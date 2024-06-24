const express = require('express');
const router = express.Router();

const blogPostController = require('../controllers/blogPostController');

// Route to retrieve blog Post
router.get('/', blogPostController.getBlogPost);

module.exports = router;