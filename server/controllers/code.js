const axios = require('axios');

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
    .then((result) => {
      res.setHeader('Content-Type', 'application/json');
      res.status(result.status).send(result.data);
    })
    .catch((err) => res.status(500).json({ message: err }));
};
