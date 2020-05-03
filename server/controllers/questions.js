const Question = require('../models/question');
const { validationResult } = require('express-validator');

exports.createQuestion = (req, res, next) => {
  if(!req.userData.isAdmin) {
    return res.status(401).json({ message: "Not authorized to use this path" })
  }

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const question = new Question({
    title: req.body.title,
    content: req.body.content,
    solutionTemplate: req.body.solutionTemplate,
    solution: req.body.solution,
    tests: req.body.tests,
    hints: req.body.hints,
    level: req.body.level,
    creator: req.userData.userId
  });

  question.save().then(createdQuestion => {
    res.status(201).json({
      message: "Question created successfully",
      questionId: createdQuestion._id
    });
  });
};

exports.deleteQuestion = (req, res, next) => {
  if(!req.userData.isAdmin) {
    return res.status(401).json({ message: "Not authorized to use this path" })
  }

  Question.deleteOne({ _id: req.params.id, creator: req.userData.userId })
  .then(result => {
    const isDeleted = result.n > 0;

    if(isDeleted) {
      res.status(200).json({message: "Question deleted"});
    } else {
      res.status(401).json({ message: 'Not authorized!' })
    }
  });
};

exports.getQuestions = (req, res, next) => {
  Question.find().then(documents => res.status(200).json(documents));
};

exports.updateQuestion = (req, res, next) => {
  if(!req.userData.isAdmin) {
    return res.status(401).json({ message: "Not authorized to use this path" })
  }

  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() })
  }

  const question = new Question({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    solutionTemplate: req.body.solutionTemplate,
    solution: req.body.solution,
    tests: req.body.tests,
    hints: req.body.hints,
    level: req.body.level,
    creator: req.userData.userId
  });

  Question.updateOne(
    {
      _id: req.body.id,
      creator: req.userData.userId
    },
    question)
    .then(result => {
      const isModified = result.n > 0;

      if(isModified) {
        res.status(200).json({ message: 'Update successful' });
      } else {
        res.status(401).json({ message: 'Not authorized!' })
      }
    });
};

exports.getQuestion = (req, res, next) => {
  Question.findById(req.params.id).then(question => {
    if(question) {
      res.status(200).json(question);
    } else {
      res.status(404).json({ message: 'Question not found!' });
    }
  });
};
