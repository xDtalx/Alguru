const request = require('request');

exports.executeCode = (req, res, next) => {
  const data = {
    lang: req.body.lang,
    code: req.body.code,
    tests: req.body.tests
  };

  request.post({
    headers: req.headers,
    url: process.env.RUN_CODE_API + '/execute',
    body: JSON.stringify(data)
  }, (err, runCodeRes, body) => {
    if(err) {
      res.status(500).json({ message: 'Unknown error' });
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(runCodeRes.statusCode).send(body);
  });
};
