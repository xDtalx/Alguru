const request = require('request');

exports.getTemplate = (req, res, next) => {
  const url = process.env.RUN_CODE_API + '/template?lang=' + req.params.lang;

  request.get(url, null, (err, runCodeRes, body) => {
    if(err) {
      console.log(err);
      return;
    }

    res.status(runCodeRes.statusCode).send(body);
  });
};

exports.executeCode = (req, res, next) => {
  const data = {
    lang: req.body.lang,
    code: req.body.code
  };

  request.post(process.env.RUN_CODE_API + "/execute", data, (err, runCodeRes, body) => {
    if(err) {
      res.status(500).json({ message: 'Unknown error: ' + err });
      return;
    }

    res.status(runCodeRes.statusCode).send(body);
  });
};
