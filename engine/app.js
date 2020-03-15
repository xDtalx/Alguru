const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin');
const alguruUserRoutes = require('./routes/alguruUser');

mongoose.connect("mongodb+srv://Admin:uCmIgjo84hiZVwIK@cluster0-obtib.mongodb.net/Alguru?retryWrites=true&w=majority")
  .then(() =>
  {
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
          
app.use('/admin', adminRoutes);
app.use(alguruUserRoutes);

module.exports = app;