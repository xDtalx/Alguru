const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // The token string in the header will be presented like - 'Bearer asfsadgfsag41'.
    // We will split the string with space and take the second part.
    const isRegisterReq = req.headers.authorization.split(' ')[1] === 'undefined';
    const notAuthRegisteration = process.env.RELEASE === 'false' && isRegisterReq;

    if (notAuthRegisteration) {
      return res.status(401).json({ message: 'Coming soon! Be patient :)' });
    } else if (!isRegisterReq) {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = jwt.verify(token, process.env.JWT_KEY);
      req.userData = {
        username: decodedToken.username,
        email: decodedToken.email,
        userId: decodedToken.userId,
        isAdmin: decodedToken.isAdmin,
      };
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Auth failed!' });
  }
};
