const express = require('express');
const router = express.Router();
const CodeController = require('../controllers/code');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const validations = [
    check('lang', 'Lang should not be empty').exists().trim().notEmpty(),
    check('code', 'Code should not be empty').exists().trim().notEmpty(),
    check('tests', 'Tests should not be empty').exists().trim().notEmpty(),
]

router.post('/execute', checkAuth, validations, CodeController.executeCode);

module.exports = router;
