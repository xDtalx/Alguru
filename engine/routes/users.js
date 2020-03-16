const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      hashedPassword: hash
    });

    user.save()
    .then(responseData => {
      res.status(201).json({
        message: "User created",
        id: responseData
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    });

  });
});

router.post('/login', (req, res, next) => {
  let fetchedUser;

  User.findOne({ username: req.body.username })
  .then(user => {

    if(!user) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    fetchedUser = user;

    return bcrypt.compare(req.body.password, user.hashedPassword);
  })
  .then(result => {
    if(!result) {
      return res.status(401).json({ message: 'Auth failed' });
    }

    const token = jwt.sign(
      { username: fetchedUser.username, email: fetchedUser.email, userId: fetchedUser._id },
      'secret_string_this_should_be_longer',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token: token,
      expiresIn: 3600
    })
  })
  .catch(err => {
    console.log(err);
    return res.status(401).json({ message: 'Auth failed' });
  });
});

router.get('', (req, res, next) => {
});

module.exports = router;
