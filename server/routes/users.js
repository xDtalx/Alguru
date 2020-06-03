const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const validations = [
  check('username', 'Username should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('password', 'Password should be at least 6 characters').exists().trim().isLength({ min: 6 }),
];
const registerCheck = [
  check('confirmPassword', 'Password should be at least 6 characters')
    .exists()
    .trim()
    .isLength({ min: 6 })
    .custom((value, { req }) => {
      const confirmPassword = value;

      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords don't match");
      } else {
        return value;
      }
    }),
  check('email', 'Invalid email').exists().isEmail().normalizeEmail({ gmail_remove_dots: false }),
];

router.post('/register', validations, registerCheck, UserController.createUser);

router.post('/login', validations, UserController.userLogin);

router.delete('/delete', checkAuth, UserController.deleteUser);

router.put('/update', checkAuth, validations, registerCheck, UserController.updateUser);

router.options('/login', (req, res, next) => res.status(200).send());

router.get('', (req, res, next) => res.status(200).send());

module.exports = router;
