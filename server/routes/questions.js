const express = require('express');
const router = express.Router();
const QuestionsController = require('../controllers/questions');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');

const validations = [
  check('title', 'Title should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('content', 'Content should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('hints', 'Hints should be exists even if its empty').exists(),
  check('tests', 'Tests should be exists even if its empty').exists(),
  check('level', 'Level should be an integer number').exists().trim().isInt(),
  check('solution', 'Solution should be exists and not empty').exists().trim().notEmpty(),
  check('solutionTemplate', 'Solution template should be exists and not empty').exists().trim().notEmpty()
];

// admin path
router.post('', checkAuth, validations, QuestionsController.createQuestion);

// admin path
router.delete('/:id', checkAuth, QuestionsController.deleteQuestion);

// admin path
router.put('/:id', checkAuth, validations, QuestionsController.updateQuestion);

router.get('', checkAuth, QuestionsController.getQuestions);

router.get('/:id', checkAuth, QuestionsController.getQuestion);

module.exports = router;
