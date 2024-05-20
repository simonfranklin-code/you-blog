const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

// Route to retrieve users
router.get('/', userController.getUsers);

module.exports = router;