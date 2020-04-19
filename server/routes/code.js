const express = require('express');
const router = express.Router();
const CodeController = require('../controllers/code');
const checkAuth = require('../filters/check-auth');

router.post('/execute', checkAuth, CodeController.executeCode);

module.exports = router;
