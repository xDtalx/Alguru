const express = require('express');
const router = express.Router();
const Question = require('../models/question');
            
router.post('/api/questions', (req, res, next) =>
{
  const question = new Question({
    title: req.body.title,
    content: req.body.content,
    solution: req.body.solution,
    hints: req.body.hints,
    level: req.body.level
  });

  question.save().then(createdQuestion =>
  {
    res.status(201).json({
      message: "Question created successfully",
      questionId: createdQuestion._id
    });
  });
});

router.delete("/api/questions/:id", (req, res, next) =>
{
  Question.deleteOne({ _id: req.params.id }).then(result =>
    {
      res.status(200).json({message: "Question deleted"});
    });
});

module.exports = router;