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

  const newVote = new Vote({
    username: req.userData.username,
    isUp: req.body.isUp,
    message: req.body.message
  });




  var  messageToDisplay ;
  var false1 = "false";
  var isUp = req.body.isUp;

  if(isUp.localeCompare(false1))
  {
    messageToDisplay = "Like! user " + req.userData.username + " liked your question: " + toPutIn.title ;
  }
  else
  {
    messageToDisplay = "DisLike! user " + req.userData.username + " disliked your question: " + toPutIn.title;
  }

  const newNotifaction = new Notification(
  {
    sender : req.userData.username,
    message : messageToDisplay,
    isViewed : false
  });


  await updateUserNotifcation(toPutIn, newNotifaction, req, res);
  await updateQuestionVotes(toPutIn, newVote, req, res);
}

async function updateUserNotifcation(question, newNotifaction, req, res) {

  User.findOne({ _id: question.creator })
    .then((user) => {
      user.notifications.push(newNotifaction);

      User.updateOne({_id : question.creator},user)
      .then((result) => {
        const isModified = result.n > 0;
        // if (isModified) {
        //   res.json({ message2: 'Updating notifications was successful' });
        // } else {
        //   res.json({ message2: 'Updating notifications was unsuccessful' });
        // }
      })
  })
    .catch(() => {
      return res.status(500).json({ message: 'Failed to find user!' });
    });
}

async function updateQuestionVotes(question, newVote, req, res) {
  question.votes.set(newVote.username, newVote);
  Question.updateOne({ _id: req.params.id }, question)
    .then(async (result) => {
      const isModified = result.n > 0;

      if (isModified) {
        return res.status(200).json({ message: 'Question updated.' });
      } else {
        return res.status(500).json({ message: 'Something went wrong. Question was not updated.' });
      }
    })
    .catch(() => res.status(500).json({ message: 'Something went wrong. Question was not updated.' }));
}
