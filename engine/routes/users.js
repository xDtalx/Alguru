const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');

router.post('/register', UserController.createUser);

router.post('/login', UserController.userLogin);

router.get('', (req, res, next) => {
});

module.exports = router;
