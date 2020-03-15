const express = require('express');
const router = express.Router();
const Question = require('../models/question');
const User = require('../models/user');

router.get('/api/questions', (req, res, next) =>
{
  Question.find().then(documents => res.status(200).json(documents));
});

router.post('/api/users', (req, res, next) => 
{
  const user = new User(
    {
      username: req.body.username,
      hashedPassword: req.body.hashedPassword
    }
  );

  user.save().then(responseData =>
    {
      res.status(201).json({
        message: "User registered successfully",
        id: responseData._id
      })
    })
});

router.get('/api/users', (req, res, next) => 
{
});

module.exports = router;