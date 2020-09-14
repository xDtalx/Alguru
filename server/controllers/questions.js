const Question = require('../models/question');
const Vote = require('../models/vote.js');
const User = require('../models/user.js');
const axios = require('axios');
const Notification = require('../models/notification.js');
const { validationResult } = require('express-validator');
const { exec } = require('child_process');

const langs = {
  0: 'java',
  1: 'javascript'
};

async function testQuestion(question) {
  let failed = false;
  let execution;

  for (let i = 0; i < question.solutionTemplate.length && !failed; i++) {
    if (question.solutionTemplate[i] !== null && question.solutionTemplate[i] !== '') {
      const data = {
        lang: langs[i],
        code: question.solution[i],
        tests: question.submitionTests[i],
        submit: false,
        questionId: null
      };

      await axios.post(process.env.RUN_CODE_API + '/execute', JSON.stringify(data)).then((result) => {
        if (
          (result.data.testsFailed !== '' && result.data.testsFailed.indexOf('true') === -1) ||
          result.data.errors !== ''
        ) {
          failed = true;
          execution = result.data;
        }
      });
    }
  }

  return execution;
}

exports.createQuestion = async (req, res, next) => {
  const errors = validationResult(req);
  const errorsArray = [...errors.array({ onlyFirstError: true }), ...checkQuestionArrays(req)];

  if (errorsArray.length > 0) {
    return res.status(422).json({ errors: errorsArray });
  }

  const question = new Question({
    title: req.body.title,
    content: req.body.content,
    solutionTemplate: fixQuestionArrays(req.body.solutionTemplate),
    solution: fixQuestionArrays(req.body.solution),
    exampleTests: fixQuestionArrays(req.body.exampleTests),
    submitionTests: fixQuestionArrays(req.body.submitionTests),
    hints: req.body.hints,
    level: req.body.level,
    votes: {},
    creator: req.userData.userId
  });
  const execution = await testQuestion(question);

  if (execution) {
    return res.status(422).json({ execution: execution });
  }

  await question.save().then(async (createdQuestion) => {
    await User.findOne({ _id: req.userData.userId }).then(async (user) => {
      user.stats.contribProblems++;
      user.stats.contribPoints += 100;
      await User.updateOne({ _id: req.userData.userId }, user);
    });

    res.status(201).json({
      message: 'Question created successfully',
      questionId: createdQuestion._id
    });
  });
};

exports.deleteQuestion = async (req, res, next) => {
  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.id };
  } else {
    searchOptions = { _id: req.params.id, creator: req.userData.userId };
  }

  await Question.findById(req.params.id)
    .then(async (question) => {
      // we need to delete from the comments array of that post
      await Question.deleteOne(searchOptions)
        .then(async (deleteResult) => {
          const isDeleted = deleteResult.n > 0;

          if (isDeleted) {
            await User.findOne({ _id: String(question.creator) }).then(async (user) => {
              user.stats.contribProblems--;
              user.stats.contribPoints -= 100;
              await User.updateOne({ _id: question.creator }, user);
            });

            res.status(200).json({ message: 'Question deleted' });
          } else {
            res.status(500).json({ message: 'Deleting the Question was unsuccessful' });
          }
        })
        .catch((err) =>
          res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
        );
    })
    .catch((err) =>
      res.status(404).json({ message: 'Question not found', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
};

exports.getQuestions = async (req, res, next) =>
  await Question.find().then((questions) => {
    questions.forEach((question) => {
      const creatorId = String(question.creator._id);

      if (creatorId !== req.userData.userId && !req.userData.isAdmin) {
        for (let i = 0; i < Object.keys(langs).length; i++) {
          question.submitionTests[i] = '';
          question.solution[i] = '';
        }
      }
    });
    res.status(200).json(questions);
  });

exports.updateQuestion = async (req, res, next) => {
  const errors = validationResult(req);
  const errorsArray = [...errors.array({ onlyFirstError: true }), ...checkQuestionArrays(req)];

  if (errorsArray.length > 0) {
    return res.status(422).json({ errors: errorsArray });
  }

  let searchOptions;

  if (req.userData.isAdmin) {
    searchOptions = { _id: req.params.id };
  } else {
    searchOptions = { _id: req.params.id, creator: req.userData.userId };
  }

  await Question.findOne(searchOptions)
    .then(async (question) => {
      question.title = req.body.title;
      question.content = req.body.content;
      question.hints = req.body.hints;
      question.level = req.body.level;
      question.exampleTests = fixQuestionArrays(req.body.exampleTests);
      question.submitionTests = fixQuestionArrays(req.body.submitionTests);
      question.solution = fixQuestionArrays(req.body.solution);
      question.solutionTemplate = fixQuestionArrays(req.body.solutionTemplate);
      const execution = await testQuestion(question);

      if (execution) {
        return res.status(422).json({ execution: execution });
      }

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
        .catch((err) =>
          res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
        );
    })
    .catch((err) =>
      res.status(401).json({ message: 'Not authorized!', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
};

exports.getQuestion = async (req, res, next) => {
  await Question.findById(req.params.id).then((question) => {
    if (question) {
      const creatorId = String(question.creator._id);

      if (creatorId !== req.userData.userId && !req.userData.isAdmin) {
        for (let i = 0; i < Object.keys(langs).length; i++) {
          question.submitionTests[i] = '';
          question.solution[i] = '';
        }
      }

      res.status(200).json(question);
    } else {
      res.status(404).json({ message: 'Question not found!' });
    }
  });
};

exports.voteOnQuestion = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  await Question.findById(req.params.id).then(async (question) => {
    if (question) {
      await putNewVoteAsync(req, res, question);
    } else {
      return res.status(404).json({ message: 'Question not found!' });
    }
  });
};

function fixQuestionArrays(array) {
  const length = array.length;

  for (let i = 0; i < length; i++) {
    if (array[i] == null) {
      array[i] = '';
    }
  }

  return array;
}

function checkQuestionArray(array, paramName) {
  let empty = true;

  array.forEach((questionVersion) => {
    if (questionVersion !== null && questionVersion !== '') {
      empty = false;
    }
  });

  return empty
    ? {
        value: array,
        msg: `${paramName} values should not be empty`,
        param: paramName,
        location: 'body'
      }
    : null;
}

function checkQuestionArrays(req) {
  const errors = [];
  const solutionTemplateError = checkQuestionArray(req.body.solutionTemplate, 'solutionTemplate');
  const exampleTestsError = checkQuestionArray(req.body.exampleTests, 'exampleTests');
  const submitionTestsError = checkQuestionArray(req.body.submitionTests, 'submitionTests');
  const solutionError = checkQuestionArray(req.body.solution, 'solution');

  if (solutionError) {
    errors.push(solutionError);
  }

  if (solutionTemplateError) {
    errors.push(solutionTemplateError);
  }

  if (exampleTestsError) {
    errors.push(exampleTestsError);
  }

  if (submitionTestsError) {
    errors.push(submitionTestsError);
  }

  const arraysSizes = [0, 0, 0, 0];
  req.body.solutionTemplate.forEach((value) => (value !== '' ? arraysSizes[0]++ : value));
  req.body.exampleTests.forEach((value) => (value !== '' ? arraysSizes[1]++ : value));
  req.body.submitionTests.forEach((value) => (value !== '' ? arraysSizes[2]++ : value));
  req.body.solution.forEach((value) => (value !== '' ? arraysSizes[3]++ : value));
  const max = arraysSizes.reduce((l1, l2) => (l1 > l2 ? l1 : l2));
  const min = arraysSizes.reduce((l1, l2) => (l1 < l2 ? l1 : l2));

  if (max !== min) {
    errors.push({
      value: null,
      msg:
        'For each programming language you should fill: Solution Template, Solution, Example Tests and Submition Tests',
      param: null,
      location: 'body'
    });
  }

  return errors;
}

async function putNewVoteAsync(req, res, toPutIn) {
  if (String(toPutIn.creator) === req.userData.userId) {
    return res.status(400).json({ message: 'User cannot vote on his own question' });
  } else if (toPutIn.votes.has(req.userData.username)) {
    return res.status(400).json({ message: 'User voted already' });
  }

  await updateUserNotificationAsync(toPutIn, req, res);
  await updateQuestionVotesAsync(toPutIn, req, res);
}

async function updateUserNotificationAsync(question, req) {
  await User.findOne({ _id: String(question.creator) }).then(async (user) => {
    const messageToDisplay = `${req.userData.username} ${req.body.isUp ? 'upvote' : 'downvote'} your question: ${
      question.title
    }`;

    user.notifications.push(
      new Notification({
        sender: req.userData.username,
        title: 'Someone voted on your question',
        content: messageToDisplay,
        seen: false,
        url: `/questions/solve/${req.params.id}`,
        createdAt: new Date().toUTCString()
      })
    );

    await User.updateOne({ _id: String(question.creator) }, user);
  });
}

async function updateQuestionVotesAsync(question, req, res) {
  const newVote = new Vote({
    username: req.userData.username,
    isUp: req.body.isUp,
    message: req.body.message
  });

  question.votes.set(newVote.username, newVote);

  await Question.updateOne({ _id: req.params.id }, question)
    .then(async (result) => {
      const isModified = result.n > 0;

      if (isModified) {
        return res.status(200).json({ message: 'Question updated.', votes: question.votes });
      } else {
        return res.status(500).json({ message: 'Something went wrong. Question was not updated.' });
      }
    })
    .catch((err) =>
      res.status(500).json({
        message: 'Something went wrong. Question was not updated.',
        stacktrace: req.userData.isAdmin ? err : '😊'
      })
    );
}
