const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.createUser = (req, res, next) => {
  const errors = validationResult(req);
  
  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      username: req.body.username,
      username_lower: req.body.username.toLowerCase(),
      email: req.body.email,
      hashedPassword: hash
    });

    user
    .save()
    .then(result => handleSuccessfulSave(result, res))
    .catch(err => handleRegisterError(err, res));
  });
};

exports.userLogin = (req, res, next) => {
  const errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  if(process.env.RELEASE == 'false' && req.body.username !== process.env.ADMIN) {
    return res.status(401).json({ message: 'Coming soon! Be patient :)' });
  }

  User.findOne({ username: req.body.username })
  .then(user => handleFoundUser(user, req, res))
  .then(user => handleAuthenticationAndResponse(user, res))
  .catch(err => handleUnknownErrorInLogin(err, res));
};

////////////////////////////////////////////////////////////////////////////////////////////////

function handleUnknownErrorInLogin(error, res) {
  res.status(401).json({ message: ['Username or password are incorrect'] });
}

function handleAuthenticationAndResponse(fetchedUser, res) {
  const token = jwt.sign(
    { username: fetchedUser.username, email: fetchedUser.email, userId: fetchedUser._id },
    process.env.JWT_KEY,
    { expiresIn: '1h' }
  );

  res.status(200).json({
    token: token,
    expiresIn: 3600,
    userId: fetchedUser._id
  })
}

function handleFoundUser(user, req, res) {
  if(!user || !bcrypt.compare(req.body.password, user.hashedPassword)) {
    return res.status(401).json({ message: ['Username or password are incorrect'] });
  }

  return user;
}

function handleSuccessfulSave(result, res) {
  res.status(201).json({
    message: "User created",
    id: result
  })
}

function handleRegisterError(error, res) {
  let errors = [];

  if(error.errors) {
    if(error.errors.username_lower) {
      errors.push('Username already taken');
    }

    if(error.errors.email) {
      errors.push('Email already taken');
    }
  }

  res.status(409).json({ message: errors });
}
