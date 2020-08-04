const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

exports.createUser = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      username: req.body.username,
      username_lower: req.body.username.toLowerCase(),
      email: req.body.email,
      hashedPassword: hash,
      numberOfSolvedQuestoins : 0,
      isAdmin: false
    });

    user
      .save()
      .then((result) => handleSuccessfulSave(result, res))
      .catch((err) => handleRegisterError(err, res));
  });
};

exports.deleteUser = (req, res, next) => {
  User.deleteOne({ _id: req.userData.userId })
    .then((result) => {
      const isDeleted = result.n > 0;

      if (isDeleted) {
        res.status(200).json({ message: 'User deleted' });
      } else {
        res.status(401).json({ message: 'Not authorized!' });
      }
    })
    .catch(() => res.status(500).json({ message: 'Deleting user was unsuccessful' }));
};

exports.updateUser = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      _id: req.userData.userId,
      username: req.body.username,
      username_lower: req.body.username.toLowerCase(),
      email: req.body.email,
      hashedPassword: hash,
      isAdmin: false
    });

    User.updateOne(
      {
        _id: req.userData.userId
      },
      user
    )
      .then((result) => {
        const isModified = result.n > 0;

        if (isModified) {
          res.status(200).json({ message: 'User updated' });
        } else {
          res.status(401).json({ message: 'Not authorized!' });
        }
      })
      .catch(() => res.status(500).json({ message: 'Updating user was unsuccessful' }));
  });
};

exports.userLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  if (process.env.RELEASE === 'false' && req.body.username !== process.env.ADMIN) {
    return res.status(401).json({ message: 'Coming soon! Be patient :)' });
  }

  User.findOne({ username: req.body.username })
    .then((user) => handleFoundUser(user, req, res))
    .catch(() => handleUnknownErrorInLogin(res));
};

function handleUnknownErrorInLogin(res) {
  res.status(401).json({ message: ['Username or password are incorrect'] });
}

function handleAuthenticationAndResponse(fetchedUser, res) {
  const token = jwt.sign(
    {
      username: fetchedUser.username,
      email: fetchedUser.email,
      userId: fetchedUser._id,
      isAdmin: fetchedUser.isAdmin
    },
    process.env.JWT_KEY,
    {
      expiresIn: '5h'
    }
  );

  res.status(200).json({
    token: token,
    expiresIn: 3600 * 5,
    username: fetchedUser.username,
    userId: fetchedUser._id,
    isAdmin: fetchedUser.isAdmin
  });
}

function handleFoundUser(user, req, res) {
  bcrypt.compare(req.body.password, user.hashedPassword).then((isEqual) => {
    if (!isEqual) {
      return res.status(401).json({ message: ['Username or password are incorrect'] });
    }

    return handleAuthenticationAndResponse(user, res);
  });
}

function handleSuccessfulSave(result, res) {
  res.status(201).json({
    message: 'User created',
    user: {
      id: result._id,
      username: result.username
    }
  });
}

function handleRegisterError(error, res) {
  const errors = [];

  if (error.errors) {
    if (error.errors.username_lower) {
      errors.push('Username already taken');
    }

    if (error.errors.email) {
      errors.push('Email already taken');
    }
  }

  res.status(409).json({ message: errors });
}
