const express = require('express');
const router = express.Router();
const QuestionsController = require('../controllers/questions');
const checkAuth = require('../filters/check-auth');
const { check } = require('express-validator');
const emailVerificationValidation = (req, res, next) => {
  if (!req.userData.verified) {
    return res.status(401).json({ message: 'Please verify your email address first' });
  }

  next();
};
const validations = [
  check('title', 'Title should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('content', 'Content should be at least 6 characters').exists().trim().isLength({ min: 6 }),
  check('hints', 'Hints should be exists even if its empty').exists(),
  check('level', 'Level should be an integer number').exists().trim().isInt(),
  check('tests', 'Tests should be exists even if its empty').exists(),
  check('solution', 'Solution should be exists and not empty').exists(),
  check('solutionTemplate', 'Solution template should be exists and not empty').exists()
];

// admin path
router.post('', checkAuth, emailVerificationValidation, validations, QuestionsController.createQuestion);

// admin path
router.delete('/:id', checkAuth, emailVerificationValidation, QuestionsController.deleteQuestion);

// admin path
router.put('/:id', checkAuth, emailVerificationValidation, validations, QuestionsController.updateQuestion);

router.get('', checkAuth, QuestionsController.getQuestions);

router.get('/:id', checkAuth, QuestionsController.getQuestion);

// vote on question
router.patch(
  '/:id',
  checkAuth,
  [
    check('username', 'Username should be at least 6 characters').exists().trim().isLength({ min: 6 }),
    check('isUp', 'Vote type not specified').exists()
  ],
  QuestionsController.voteOnQuestion
);

module.exports = router;
