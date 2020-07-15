const express = require('express');
const app = express();
const mongoose = require('mongoose');
const questionsRoutes = require('./routes/questions.js');
const usersRoutes = require('./routes/users.js');
const codeRoutes = require('./routes/code.js');
const forumRoutes = require('./routes/forum.js');
const imagesRoutes = require('./routes/images.js');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const limiter = rateLimit({
  windowMs: 10000,
  max: 200,
  message: 'Too many requests from this IP, please try again'
});

mongoose
  .connect(process.env.MONGO_AUTH, {
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => {
    console.log('Connected to database.');
  })
  .catch((err) => {
    console.log('Connection failed.');
    console.log(err);
  });

app.use(helmet());
app.use(morgan('tiny'));
app.use(limiter);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Request-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');
  next();
});
app.use('/questions', questionsRoutes);
app.use('/users', usersRoutes);
app.use('/code', codeRoutes);
app.use('/forum', forumRoutes);
app.use('/image', imagesRoutes);

module.exports = app;
