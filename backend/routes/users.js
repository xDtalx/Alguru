const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../filters/check-auth');

router.post('/register', checkAuth, UserController.createUser);

router.post('/login', UserController.userLogin);

router.get('', (req, res, next) => {
});

module.exports = router;
