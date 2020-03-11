const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const Question = require('./models/question');

mongoose.connect("mongodb+srv://Admin:uCmIgjo84hiZVwIK@cluster0-obtib.mongodb.net/Alguru?retryWrites=true&w=majority")
  .then(() => {
    console.log('Connected to database.');
  })
  .catch(() => {
    console.log('Connection failed.');
  });

app.use(bodyParser.json());

app.use((req, res, next) =>
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.post('/api/questions', (req, res, next) => {
  const question = new Question({
    title: req.body.title,
    content: req.body.content,
    solution: req.body.solution,
    hints: req.body.hints,
    level: req.body.level,
  });

  question.save();

  res.status(201).json({
    message: 'Question posted successfully'
  });
});

app.use((req, res, next) =>
{
  res.send('hey hey hey');
});

module.exports = app;
