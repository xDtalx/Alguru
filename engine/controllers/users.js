const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let fetchedUser;

exports.createUser = (req, res, next) => {
  let errors = checkErrorsInRegisterForm(req);

  if(errors.length > 0) {
    return res.status(500).json({ message: errors });
  }

  bcrypt.hash(req.body.password, 10).then(hash => {
    const user = new User({
      username: req.body.username,
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
  let errors = checkErrorsInLoginForm(req);

  if(errors.length > 0) {
    return res.status(401).json({ message: errors });
  }

  User.findOne({ username: req.body.username })
  .then(user => handleFoundUser(user, req, res))
  .then(isPasswordMatch => handleAuthenticationAndResponse(isPasswordMatch, fetchedUser, res))
  .catch(err => handleUnknownErrorInLogin(err, res));
};

////////////////////////////////////////////////////////////////////////////////////////////////

function handleUnknownErrorInLogin(error, res) {
  res.status(401).json({ message: ['Username or password are incorrect'] });
}

function handleAuthenticationAndResponse(isPasswordMatch, fetchedUser, res) {
  if(!isPasswordMatch) {
    return res.status(401).json({ message: ['Username or password are incorrect'] });
  }

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
  if(!user) {
    return res.status(401).json({ message: ['Username or password are incorrect'] });
  }

  fetchedUser = user;

  return bcrypt.compare(req.body.password, user.hashedPassword);
}

function checkErrorsInLoginForm(req) {
  let errors = [];

  if(req.body.username.length < 6) {
    errors.push('Username length should be at least 6 characters');
  }

  if(req.body.password.length < 6) {
    errors.push('Password length should be at least 6 characters');
  }

  return errors;
}

function checkErrorsInRegisterForm(req) {
  let errors = [];

  if(req.body.username.length < 6) {
    errors.push('Username length should be at least 6 characters');
  }

  if(req.body.password.length < 6) {
    errors.push('Password length should be at least 6 characters');
  }

  return errors;
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
    if(error.errors.username) {
      errors.push('Username already taken');
    }

    if(error.errors.email) {
      errors.push('Email already taken');
    }
  }

  res.status(500).json({ message: errors });
}
