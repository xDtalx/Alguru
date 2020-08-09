const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const validations = [
  check('username', 'Username should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('password', 'Password should be at least 6 characters').exists().trim().isLength({ min: 6 })
];
const confirmPasswordCheck = [
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
    })
];
const emailCheck = [check('email', 'Invalid email').exists().isEmail().normalizeEmail({ gmail_remove_dots: false })];

router.post('/register', validations, confirmPasswordCheck, emailCheck, UserController.createUser);

router.post('/login', validations, UserController.userLogin);

router.post(
  '/login/reset',
  [check('email', 'Invalid email').exists().isEmail().normalizeEmail({ gmail_remove_dots: false })],
  UserController.sendResetPasswordEmail
);

router.post(
  '/login/reset/:resetToken',
  [check('password', 'Password should be at least 6 characters').exists().trim().isLength({ min: 6 })],
  confirmPasswordCheck,
  UserController.resetPassword
);

router.delete('/delete', checkAuth, UserController.deleteUser);

router.put('/update', checkAuth, validations, confirmPasswordCheck, emailCheck, UserController.updateUser);

router.get('/verify/:verifyToken', UserController.verifyUser);

router.post('/verify/resend', checkAuth, UserController.resendVarificationEmail);

module.exports = router;
