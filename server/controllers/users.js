const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
let mailer;

exports.resendVarificationEmail = async (req, res, next) => {
  if (req.userData.verified) {
    res.status(400).json({ message: 'User is already verified' });
  } else {
    await User.findOne({ _id: req.userData.userId }).then((user) => {
      if (user.verified) {
        res.status(400).json({ message: 'User is already verified' });
      } else {
        sendVarificationEmail(req.userData.username, req.userData.email);
        res.status(200).json({ message: 'Varification email sent' });
      }
    });
  }
};

exports.verifyUser = async (req, res, next) => {
  const token = req.params.verifyToken;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    await User.updateOne({ username: decodedToken.username }, { $set: { verified: true } }).then((result) => {
      const isModified = result.n > 0;

      if (isModified) {
        res.status(200).json({ message: `${decodedToken.username} is verified` });
      } else {
        res.status(500).json({ message: 'Unknown error' });
      }
    });
  } catch {
    res.status(401).json({ message: 'Verify token is invalid' });
  }
};

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        username: req.body.username,
        username_lower: req.body.username.toLowerCase(),
        email: req.body.email,
        hashedPassword: hash,
        isAdmin: false,
        verified: false
      });

      user
        .save()
        .then((result) => handleSuccessfulSave(result, res))
        .catch((err) => handleRegisterError(err, res));
    })
    .catch((err) => console.log(err));
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
      isAdmin: fetchedUser.isAdmin,
      verified: fetchedUser.verified
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

function handleSuccessfulSave(savedUser, res) {
  sendVarificationEmail(savedUser.username, savedUser.email);
  res.status(201).json({
    message: 'User created',
    user: {
      id: savedUser._id,
      username: savedUser.username
    }
  });
}

async function sendVarificationEmail(username, email) {
  if (!mailer) {
    let testAccount;

    if (process.env.TYPE === 'dev') {
      testAccount = await nodemailer.createTestAccount();
    }

    // create reusable transporter object using the default SMTP transport
    mailer = nodemailer.createTransport({
      service: testAccount ? null : process.env.EMAIL_SERVICE,
      host: testAccount ? 'smtp.ethereal.email' : process.env.EMAIL_HOST,
      port: testAccount ? 587 : process.env.EMAIL_PORT,
      secure: testAccount ? false : process.env.EMAIL_SECURE, // true for 465, false for other ports
      auth: {
        user: testAccount ? testAccount.user : process.env.EMAIL_USER, // generated ethereal user
        pass: testAccount ? testAccount.pass : process.env.EMAIL_PASS // generated ethereal password
      }
    });
  }

  const token = jwt.sign({ username: username }, process.env.JWT_KEY, { expiresIn: '5h' });

  // send mail with defined transport object
  const info = await mailer.sendMail({
    from: '"No Reply" <alguru.dev@gmail.com>', // sender address
    to: email, // list of receivers
    subject: 'Alguru Verification Email', // Subject line
    html: `<p>Hello ${username},</p>
    <p>Please verify your email address in. </p>
    <p>
      <a href="${process.env.CLIENT_URL}/users/verify/${token}">
        Click here
      </a>
      <span> to verify.</span>
    </p>`
  });

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
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

  console.log(error);
  res.status(409).json({ message: errors });
}
