const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const { check } = require('express-validator');
const validations =  [
  check('username', 'Username should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('password', 'Password should be at least 6 characters').exists().trim().isLength({ min: 6 })
]
const registerCheck = [
  check('email', 'Invalid email').exists().isEmail().normalizeEmail()
]

router.post('/register',validations, registerCheck, UserController.createUser);

router.post('/login', validations, UserController.userLogin);

router.options('/login', (req, res, next) => res.status(200).send());

router.get('', (req, res, next) => res.status(200).send());

module.exports = router;
