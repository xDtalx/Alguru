const express = require('express');
const app = express();
const cors = require('cors');
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
// app.use(morgan('tiny'));
app.use(limiter);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use('/questions', questionsRoutes);
app.use('/users', usersRoutes);
app.use('/code', codeRoutes);
app.use('/forum', forumRoutes);
app.use('/image', imagesRoutes);
app.use('/', (req, res) => res.status(200).json({ message: 'Welcome To Alguru API!' }));

module.exports = app;
