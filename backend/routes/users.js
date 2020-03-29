const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const { check } = require('express-validator');

router.post(
  '/register',
  [
    check('username', 'Username should be at least 6 characters').exists().trim().isLength({ min: 6 }),
    check('email', 'Invalid email').exists().isEmail().normalizeEmail(),
    check('password', 'Password should be at least 6 characters').exists().trim().isLength({ min: 6 })
  ],
  UserController.createUser);

router.post(
  '/login',
  UserController.userLogin);

router.get('', (req, res, next) => {
});

module.exports = router;
