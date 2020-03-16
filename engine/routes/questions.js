const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const checkAuth = require('../filters/check-auth');

router.post('', checkAuth, (req, res, next) =>
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

router.delete("/:id", checkAuth, (req, res, next) =>
{
  Question.deleteOne({ _id: req.params.id }).then(result =>
    {
      res.status(200).json({message: "Question deleted"});
    });
});

router.get('', (req, res, next) =>
{
  Question.find().then(documents => res.status(200).json(documents));
});

router.put('/:id', checkAuth, (req, res, next) => {
  const question = new Question({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    solution: req.body.solution,
    hints: req.body.hints,
    level: req.body.level
  });

  Question.updateOne({ _id: req.params.id }, question).then(result => {
    res.status(200).json({ message: 'Update successful' });
  });
});

router.get('/:id', (req, res, next) => {
  Question.findById(req.params.id).then(question => {
    if(question)
    {
      res.status(200).json(question);
    }
    else
    {
      res.status(404).json({ message: 'Question not found!' });
    }
  });
})

module.exports = router;
