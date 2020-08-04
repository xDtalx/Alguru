const axios = require('axios');
const User = require('../models/user');

exports.executeCode = (req, res, next) => {
  const data = {
    lang: req.body.lang,
    code: req.body.code,
    tests: req.body.tests
  };
  
  const config = {
    headers: req.headers
  };

  axios
    .post(process.env.RUN_CODE_API + '/execute', JSON.stringify(data), config)
    .then(async (result) => {
      if (result.data.testsFailed === '') {
        const questionId = req.body.questionId;

        await User
        .findOne({ _id: req.userData.userId })
        .then(async user => {
          user.solvedQuestions.set(questionId, 'true');
          await User.updateOne({ _id: req.userData.userId }, user);
        });
      }

      res.setHeader('Content-Type', 'application/json');
      res.status(result.status).send(result.data);
    })
    .catch((err) => res.status(500).json({ message: err }));
};
