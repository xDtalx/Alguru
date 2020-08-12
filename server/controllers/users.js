const User = require('../models/user');
const TmpToken = require('../models/tmp-token');
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
        sendVarificationEmail(req.userData);
        res.status(200).json({ message: 'Varification email sent' });
      }
    });
  }
};

exports.verifyUser = async (req, res, next) => {
  const verifyToken = req.params.verifyToken;
  try {
    const decodedToken = jwt.verify(verifyToken, process.env.JWT_KEY);

    await User.updateOne({ username: decodedToken.username }, { $set: { verified: true } }).then((result) => {
      const isModified = result.n > 0;

      if (isModified) {
        const newToken = jwt.sign(
          {
            username: decodedToken.username,
            email: decodedToken.email,
            userId: decodedToken._id,
            isAdmin: decodedToken.isAdmin,
            verified: true
          },
          process.env.JWT_KEY,
          {
            expiresIn: '5h'
          }
        );
        res.status(200).json({ message: 'User is verified', token: newToken, expiresIn: 3600 * 5 });
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
        verified: false,
        notifications : []
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

exports.resetPassword = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const resetToken = req.params.resetToken;

  try {
    const decodedToken = jwt.verify(resetToken, process.env.JWT_KEY);

    // deleting the tmp token so next time it couldn't be used.
    await TmpToken.deleteOne({ token: resetToken })
      .then(async (result) => {
        const deleted = result.n > 0;

        if (!deleted) {
          return res.status(400).json({ message: 'This token already used to reset password...' });
        }

        await bcrypt
          .hash(req.body.password, 10)
          .then(async (hash) => {
            await User.updateOne({ _id: decodedToken.userId }, { $set: { hashedPassword: hash } })
              .then((result) => {
                const isModified = result.n > 0;

                if (isModified) {
                  res.status(200).json({ message: 'Password changed successfully' });
                } else {
                  res.status(500).json({ message: 'Unknown error on password update' });
                }
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      })
      .catch(() => res.status(500).json({ message: 'Unknown error when trying to use the reset token' }));
  } catch {
    res.status(400).json({ message: 'Reset token is invalid' });
  }
};

exports.sendResetPasswordEmail = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const email = req.body.email;

  User.findOne({ email: email })
    .then((user) => {
      sendResetPasswordEmail({
        username: user.username,
        email: user.email,
        id: user._id,
        isAdmin: user.isAdmin,
        verified: user.verified
      });

      res.status(200).json({ message: 'Reset password email sent' });
    })
    .catch(() => {
      res.status(400).json({ message: 'User with the given email address not exists' });
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
    isAdmin: fetchedUser.isAdmin,
    verified: fetchedUser.verified
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
  sendVarificationEmail({
    username: savedUser.username,
    email: savedUser.email,
    userId: savedUser._id,
    isAdmin: savedUser.isAdmin,
    verified: false
  });

  res.status(201).json({
    message: 'User created',
    user: {
      id: savedUser._id,
      username: savedUser.username
    }
  });
}

async function initMailer() {
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
}

async function sendResetPasswordEmail(userData) {
  await initMailer();

  const token = jwt.sign(
    {
      username: userData.username,
      email: userData.email,
      userId: userData.id,
      isAdmin: userData.isAdmin,
      verified: false
    },
    process.env.JWT_KEY,
    {
      expiresIn: 1000 * 60 * 10 // 10 minutes
    }
  );

  const tmpToken = new TmpToken({ token });
  await tmpToken.save().then(async (savedTmpToken) => {
    // send mail with defined transport object
    const info = await mailer.sendMail({
      from: '"No Reply" <alguru.dev@gmail.com>', // sender address
      to: userData.email, // list of receivers
      subject: 'Reset Password', // Subject line
      html: `<p>Hello ${userData.username},</p>
      <p>
        <a href="${process.env.CLIENT_URL}/users/login/reset/${token}">
          Click here
        </a>
        <span> to reset your password.</span>
      </p>`
    });

    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
}

async function sendVarificationEmail(userData) {
  await initMailer();

  const token = jwt.sign(
    {
      username: userData.username,
      email: userData.email,
      userId: userData.id,
      isAdmin: userData.isAdmin,
      verified: false
    },
    process.env.JWT_KEY,
    {
      expiresIn: '5h'
    }
  );

  // send mail with defined transport object
  const info = await mailer.sendMail({
    from: '"No Reply" <alguru.dev@gmail.com>', // sender address
    to: userData.email, // list of receivers
    subject: 'Alguru Verification Email', // Subject line
    html: `<p>Hello ${userData.username},</p>
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
