const User = require('../models/user');
const Stats = require('../models/stats');
const TmpToken = require('../models/tmp-token');
const Image = require('../models/image');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.getStats = async (req, res, next) => {
  await User.findOne({ _id: req.userData.userId })
    .then((user) => {
      if (user) {
        const stats = {
          solvedQuestions: user.stats.solvedQuestions,
          contribPoints: user.stats.contribPoints,
          contribProblems: user.stats.contribProblems,
          contribComments: user.stats.contribComments
        };
        res.status(200).json(stats);
      } else {
        res.status(404).json({ message: "Can't get user stats. User not found" });
      }
    })
    .catch((err) =>
      res
        .status(404)
        .json({ message: "Can't get user stats. User not found", stacktrace: req.userData.isAdmin ? err : '😊' })
    );
};

exports.getSolvedQuestions = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  await User.findOne({ _id: req.userData.userId }).then((user) => res.status(200).json(user.stats.solvedQuestions));
};

exports.markNotificationsAsSeen = async (req, res, next) => {
  if (!req.userData) {
    return res.json(401).json({ message: 'User information missing' });
  }

  await User.findOne({ _id: req.userData.userId })
    .then(async (user) => {
      user.notifications.forEach((notification) => {
        notification.seen = true;
        notification.isViewed = true;
      });
      await User.updateOne({ _id: req.userData.userId }, user)
        .then((result) => {
          const isModified = result.n > 0;

          if (isModified) {
            return res.status(200).json({ message: 'Notifications updated successfully' });
          } else {
            return res.status(500).json({ message: 'Unknown error! Notifications cannot be updated' });
          }
        })
        .catch((err) =>
          res.status(400).json({ message: 'User cannot be found', stacktrace: req.userData.isAdmin ? err : '😊' })
        );
    })
    .catch((err) => res.status(500).json({ message: 'Unknown error', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

exports.getNotifications = async (req, res, next) => {
  if (!req.userData) {
    return res.status(401).json({ message: 'User infos are missing' });
  }

  await User.findOne({ _id: req.userData.userId })
    .then((user) => res.status(200).json(user.notifications))
    .catch((err) => res.status(500).json({ message: 'Unknown error', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

exports.resendVarificationEmail = async (req, res, next) => {
  if (req.userData.verified) {
    res.status(400).json({ message: 'User is already verified' });
  } else {
    await User.findOne({ _id: req.userData.userId })
      .then((user) => {
        if (user.verified) {
          res.status(400).json({ message: 'User is already verified' });
        } else {
          sendVarificationEmail(req.userData);
          res.status(200).json({ message: 'Varification email sent' });
        }
      })
      .catch((err) => console.log(err));
  }
};

exports.verifyUser = async (req, res, next) => {
  const verifyToken = req.params.verifyToken;

  try {
    const decodedToken = jwt.verify(verifyToken, process.env.JWT_KEY);

    await User.updateOne({ username_lower: decodedToken.username.toLowerCase() }, { $set: { verified: true } }).then(
      (result) => {
        const isModified = result.n > 0;

        if (isModified) {
          const newToken = jwt.sign(
            {
              username: decodedToken.username,
              email: decodedToken.email,
              userId: decodedToken.userId,
              isAdmin: decodedToken.isAdmin,
              verified: true
            },
            process.env.JWT_KEY,
            {
              expiresIn: '5h'
            }
          );

          res.status(200).json({
            token: newToken,
            expiresIn: 3600 * 5,
            userId: decodedToken.userId,
            username: decodedToken.username,
            isAdmin: decodedToken.isAdmin,
            verified: true
          });
        } else {
          res.status(500).json({ message: 'Unknown error' });
        }
      }
    );
  } catch {
    res.status(401).json({ message: 'Verify token is invalid' });
  }
};

exports.createUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  await bcrypt
    .hash(req.body.password, 10)
    .then(async (hash) => {
      const user = new User({
        username: req.body.username,
        username_lower: req.body.username.toLowerCase(),
        email: req.body.email,
        hashedPassword: hash,
        isAdmin: false,
        verified: false,
        notifications: [],
        stats: new Stats()
      });

      await user
        .save()
        .then(async (result) => await handleSuccessfulSaveAsync(result, res))
        .catch((err) => handleRegisterError(err, res));
    })
    .catch((err) => res.status(500).json({ message: 'Unknown error', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

exports.deleteUser = async (req, res, next) => {
  await User.deleteOne({ _id: req.userData.userId })
    .then(async (result) => {
      const isUserDeleted = result.n > 0;

      if (isUserDeleted) {
        await Image.deleteOne({ name: req.userData.username })
          .then(() => res.status(200).json({ message: 'User deleted' }))
          .catch(() => res.status(500).json({ message: 'Unknown error! User profile image could not be deleted' }));
      } else {
        res.status(401).json({ message: 'Not authorized!' });
      }
    })
    .catch((err) =>
      res.status(500).json({ message: 'Deleting user was unsuccessful', stacktrace: req.userData.isAdmin ? err : '😊' })
    );
};

exports.getUserInfo = async (req, res, next) => {
  await User.findOne({ username_lower: req.params.username.toLowerCase() })
    .then((user) => {
      const info = {
        username: user.username,
        email: req.userData.username.toLowerCase() === req.params.username.toLowerCase() ? user.email : '😊',
        socials: user.socials
      };

      res.status(200).json(info);
    })
    .catch((err) => res.status(404).json({ message: 'User not found', stacktrace: req.userData.isAdmin ? err : '😊' }));
};

exports.updateUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const isVerified = req.body.email ? req.userData.email === req.body.email : req.userData.isVerified;
  await User.findOne({ _id: req.userData.userId })
    .then(async (user) => {
      await bcrypt.compare(req.body.password, user.hashedPassword).then(async (isEqual) => {
        if (!isEqual) {
          return res.status(401).json({ message: ['Password is incorrect'] });
        }

        let hashedPassword;

        if (req.body.newPassword) {
          await bcrypt.hash(req.body.newPassword, 10).then(async (hash) => (hashedPassword = hash));
        } else {
          hashedPassword = user.hashedPassword;
        }

        await User.updateOne(
          {
            _id: req.userData.userId
          },
          {
            $set: {
              username: req.body.username || req.userData.username,
              username_lower: (req.body.username || req.userData.username).toLowerCase(),
              email: req.body.email || req.userData.email,
              hashedPassword: hashedPassword,
              isAdmin: req.userData.isAdmin,
              verified: isVerified,
              socials: req.body.socials || user.socials
            }
          }
        )
          .then(async (result) => {
            const isModified = result.n > 0;

            if (isModified) {
              if (!isVerified) {
                await sendResetPasswordEmailAsync({
                  username: req.body.username || req.userData.username,
                  email: req.body.email || req.userData.email,
                  id: req.userData.userId,
                  isAdmin: req.userData.isAdmin,
                  verified: isVerified
                });
              }

              res.status(200).json({ message: 'User updated' });
            } else {
              res.status(401).json({ message: 'Not authorized!' });
            }
          })
          .catch((err) =>
            res
              .status(500)
              .json({ message: 'Updating user was unsuccessful', stacktrace: req.userData.isAdmin ? err : '😊' })
          );
      });
    })
    .catch((err) => res.stats(500).json({ message: 'Unknown error', stacktrace: req.userData.isAdmin ? err : '😊' }));
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
      .catch((err) =>
        res.status(500).json({
          message: 'Unknown error when trying to use the reset token',
          stacktrace: req.userData.isAdmin ? err : '😊'
        })
      );
  } catch {
    res.status(400).json({ message: 'Reset token is invalid' });
  }
};

exports.sendResetPasswordEmail = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  const email = req.body.email;

  await User.findOne({ email: email })
    .then(async (user) => {
      await sendResetPasswordEmailAsync({
        username: user.username,
        email: user.email,
        userId: user._id,
        isAdmin: user.isAdmin,
        verified: user.verified
      });

      res.status(200).json({ message: 'Reset password email sent' });
    })
    .catch((err) => {
      res.status(400).json({
        message: 'User with the given email address not exists',
        stacktrace: req.userData.isAdmin ? err : '😊'
      });
    });
};

exports.userLogin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) });
  }

  if (process.env.RELEASE === 'false' && req.body.username !== process.env.ADMIN) {
    return res.status(401).json({ message: 'Coming soon! Be patient :)' });
  }

  await User.findOne({ username_lower: req.body.username.toLowerCase() })
    .then(async (user) => await handleFoundUserAsync(user, req, res))
    .catch((err) => handleUnknownErrorInLogin(req, err, res));
};

function handleUnknownErrorInLogin(req, err, res) {
  res.status(401).json({
    message: ['Username or password are incorrect'],
    stacktrace: req.userData && req.userData.isAdmin ? err : '😊'
  });
}

function handleAuthenticationAndResponse(fetchedUser, res) {
  const token = jwt.sign(
    {
      username: fetchedUser.username_lower,
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

async function handleFoundUserAsync(user, req, res) {
  await bcrypt.compare(req.body.password, user.hashedPassword).then((isEqual) => {
    if (!isEqual) {
      return res.status(401).json({ message: ['Username or password are incorrect'] });
    }

    return handleAuthenticationAndResponse(user, res);
  });
}

async function handleSuccessfulSaveAsync(savedUser, res) {
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

async function sendResetPasswordEmailAsync(userData) {
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
  await tmpToken.save().then(() => {
    const msg = {
      to: userData.email,
      from: 'No Reply <noreply@alguru.xyz>',
      subject: 'Reset Password',
      html: `<p>Hello ${userData.username},</p>
      <p>
        <a href="${process.env.CLIENT_URL}/users/login/reset/${token}">
          Click here
        </a>
        <span> to reset your password.</span>
      </p>`
    };

    sgMail.send(msg);
  });
}

function sendVarificationEmail(userData) {
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

  sgMail.send({
    to: userData.email,
    from: 'No Reply <noreply@alguru.xyz>',
    subject: 'Alguru Verification Email',
    html: `<p>Hello ${userData.username},</p>
    <p>Please verify your email address. </p>
    <p>
      <a href="${process.env.CLIENT_URL}/users/verify/${token}">
        Click here
      </a>
      <span> to verify.</span>
    </p>`
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
