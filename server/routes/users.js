const express = require('express');
const router = express.Router();
const UserController = require('../controllers/users');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const usernameCheck = [
  check('username', 'Username should be at least 6 characters').exists().trim().isLength({ min: 6 })
];
const passwordCheck = [
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

router.post('/register', usernameCheck, passwordCheck, confirmPasswordCheck, emailCheck, UserController.createUser);

router.post('/login', usernameCheck, passwordCheck, UserController.userLogin);

router.post('/login/reset', emailCheck, UserController.sendResetPasswordEmail);

router.post(
  '/login/reset/:resetToken',
  [check('password', 'Password should be at least 6 characters').exists().trim().isLength({ min: 6 })],
  confirmPasswordCheck,
  UserController.resetPassword
);

router.delete('/delete', checkAuth, UserController.deleteUser);

router.put('/update', checkAuth, passwordCheck, confirmPasswordCheck, UserController.updateUser);

router.post('/verify/resend', checkAuth, UserController.resendVarificationEmail);

router.get('/verify/:verifyToken', UserController.verifyUser);

router.get('/notifications', checkAuth, UserController.getNotifications);

router.get('/solvedQuestions', checkAuth, UserController.getSolvedQuestions);

router.get('/stats', checkAuth, UserController.getStats);

router.get('/info/:username', checkAuth, UserController.getUserInfo);

router.put('/notifications', checkAuth, UserController.markNotificationsAsSeen);

module.exports = router;
