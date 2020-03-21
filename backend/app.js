const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const questionsRoutes = require('./routes/questions');
const usersRoutes = require('./routes/users');

mongoose.connect(process.env.MONGO_AUTH)
  .then(() => {
    console.log('Connected to database.');
  })
  .catch(() => {
    console.log('Connection failed.');
  });

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
  next();
});

app.use('/api/questions', questionsRoutes);
app.use('/api/users', usersRoutes);

module.exports = app;
