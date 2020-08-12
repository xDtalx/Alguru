const Question = require('../models/question');
const Vote = require('../models/vote.js');
const User = require('../models/user.js');
const Notification = require('../models/notification.js');
const { validationResult } = require('express-validator');

exports.createQuestion = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const question = new Question({
    title: req.body.title,
    content: req.body.content,
    solutionTemplate: req.body.solutionTemplate,
    solution: req.body.solution,
    tests: req.body.tests,
    hints: req.body.hints,
    level: req.body.level,
    votes: {},
    creator: req.userData.userId
  });

  question.save().then((createdQuestion) => {
    res.status(201).json({
      message: 'Question created successfully',
      questionId: createdQuestion._id
    });
  });
};

exports.deleteQuestion = (req, res, next) => {
  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.id };
  } else {
    searchOptions = { _id: req.params.id, creator: req.userData.userId };
  }

  // we need to delete from the comments array of that post
  Question.deleteOne(searchOptions)
    .then(async (deleteResult) => {
      const isDeleted = deleteResult.n > 0;

      if (isDeleted) {
        res.status(200).json({ message: 'Question deleted' });
      } else {
        res.status(500).json({ message: 'Deleting the Question was unsuccessful' });
      }
    })
    .catch(() => res.status(401).json({ message: 'Not authorized!' }));
};

exports.getQuestions = (req, res, next) => {
  Question.find().then((documents) => res.status(200).json(documents));
};

exports.updateQuestion = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.id };
  } else {
    searchOptions = { _id: req.params.id, creator: req.userData.userId };
  }

  Question.findOne(searchOptions)
    .then(async (question) => {
      question.title = req.body.title;
      question.content = req.body.content;
      question.tests = req.body.tests;
      question.hints = req.body.hints;
      question.level = req.body.level;
      question.solution = req.body.solution;
      question.solutionTemplate = req.body.solutionTemplate;

      await Question.updateOne(searchOptions, question)
        .then(async function (result) {
          const isModified = result.n > 0;

          if (isModified) {
            const updatedQuestion = await Question.findById(req.params.id);
            res.status(200).json({ message: 'Question updated', question: updatedQuestion });
          } else {
            res.status(500).json({ message: 'Something went wrong. Question is not updated.' });
          }
        })
        .catch(() => res.status(401).json({ message: 'Not authorized!' }));
    })
    .catch(() => res.status(401).json({ message: 'Not authorized!' }));
};

exports.getQuestion = (req, res, next) => {
  Question.findById(req.params.id).then((question) => {
    if (question) {
      res.status(200).json(question);
    } else {
      res.status(404).json({ message: 'Question not found!' });
    }
  });
};

exports.voteOnQuestion = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  Question.findById(req.params.id).then((question) => {
    if (question) {
      putNewVote(req, res, question);
    } else {
      return res.status(404).json({ message: 'Question not found!' });
    }
  });
};

async function putNewVote(req, res, toPutIn) {
  if (toPutIn.creator === req.userData.userId) {
    return res.status(400).json({ message: 'User cannot vote on his own question' });
  } else if (toPutIn.votes.has(req.userData.username)) {
    return res.status(400).json({ message: 'User voted already' });
  }

  await updateUserNotification(toPutIn, req, res);
  await updateQuestionVotes(toPutIn, req, res);
}

async function updateUserNotification(question, req) {
  console.log('question', question);
  await User.findOne({ _id: question.creator }).then(async (user) => {
    console.log('user', user);
    const messageToDisplay = `${req.userData.username} ${req.body.isUp ? 'upvote' : 'downvote'} your question: ${
      question.title
    }`;

    user.notifications.push(
      new Notification({
        sender: req.userData.username,
        title: 'Someone voted on your question',
        content: messageToDisplay,
        seen: false,
        url: `/questions/solve/${req.params.id}`
      })
    );

    await User.updateOne({ _id: question.creator }, user);
  });
}

async function updateQuestionVotes(question, req, res) {
  const newVote = new Vote({
    username: req.userData.username,
    isUp: req.body.isUp,
    message: req.body.message
  });

  question.votes.set(newVote.username, newVote);

  Question.updateOne({ _id: req.params.id }, question)
    .then(async (result) => {
      const isModified = result.n > 0;

      if (isModified) {
        return res.status(200).json({ message: 'Question updated.', votes: question.votes });
      } else {
        return res.status(500).json({ message: 'Something went wrong. Question was not updated.' });
      }
    })
    .catch(() => res.status(500).json({ message: 'Something went wrong. Question was not updated.' }));
}
