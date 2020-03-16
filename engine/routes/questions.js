const express = require('express');
const router = express.Router();
const QuestionsController = require('../controllers/questions');
const checkAuth = require('../filters/check-auth');

router.post('', checkAuth, QuestionsController.createQuestion);

router.delete("/:id", checkAuth, QuestionsController.deleteQuestion);

router.get('', QuestionsController.getQuestions);

router.put('/:id', checkAuth, QuestionsController.updateQuestion);

router.get('/:id', QuestionsController.getQuestion);

module.exports = router;
