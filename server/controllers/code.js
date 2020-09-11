const axios = require('axios');
const User = require('../models/user');
const Question = require('../models/question');

const langToIndex = {
  java: 0,
  javascript: 1
};

exports.executeCode = async (req, res, next) => {
  const data = {
    lang: req.body.lang,
    code: req.body.code,
    tests: req.body.tests
  };
  let questionFound = true;

  if (req.body.submit) {
    questionFound = await setSubmitTestsAsync(req, res, data);
  }

  if (questionFound) {
    await sendCodeToExecutionAsync(req, res, data);
  }
};

async function setSubmitTestsAsync(req, res, data) {
  let questionFound = true;

  await Question.findOne({ _id: req.body.questionId })
    .then(async (question) => {
      data.tests = question.submitionTests[langToIndex[data.lang.toLowerCase()]];
    })
    .catch((err) => {
      res.status(400).json({ message: 'Question was not found', stacktrace: req.userData.isAdmin ? err : '😊' });
      questionFound = false;
    });

  return questionFound;
}

async function sendCodeToExecutionAsync(req, res, data) {
  const config = {
    headers: req.headers
  };

  await axios
    .post(process.env.RUN_CODE_API + '/execute', JSON.stringify(data), config)
    .then(async (result) => {
      if (req.body.submit && (!result.data.testsFailed || result.data.testsFailed === '')) {
        const questionId = req.body.questionId;

        await User.findOne({ _id: req.userData.userId })
          .then(async (user) => {
            user.stats.solvedQuestions.set(questionId, true);
            await User.updateOne({ _id: req.userData.userId }, user);
          })
          .catch((err) => console.log(err));
      }

      res.setHeader('Content-Type', 'application/json');

      if (req.body.submit) {
        res.status(result.status).json({
          message: result.data.message,
          output: '',
          errors: '',
          durationInSeconds: result.data.durationInSeconds,
          testsFailed: ''
        });
      } else {
        res.status(result.status).send(result.data);
      }
    })
    .catch((err) => res.status(500).json({ message: err, stacktrace: req.userData.isAdmin ? err : '😊' }));
}
