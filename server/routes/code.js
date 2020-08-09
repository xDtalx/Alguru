const express = require('express');
const router = express.Router();
const CodeController = require('../controllers/code');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const validations = [
  check('lang', 'Lang should not be empty').exists().trim().notEmpty(),
  check('code', 'Code should not be empty').exists().trim().notEmpty(),
  check('tests', 'Tests should not be empty').exists().trim().notEmpty()
];
const emailVerificationValidation = (req, res, next) => {
  if (!req.userData.verified) {
    return res.status(401).json({ message: 'Please verify your email address first' });
  }

  next();
};

router.post('/execute', checkAuth, emailVerificationValidation, validations, CodeController.executeCode);

module.exports = router;
