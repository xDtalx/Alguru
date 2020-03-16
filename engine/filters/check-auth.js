const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // The token string in the header will be presented like - 'Bearer asfsadgfsag41'.
    // We will split the string with space and take the second part.
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, 'secret_string_this_should_be_longer');
    next();
  } catch(err) {
    res.status(401).json({ message: 'Auth failed!' });
  }
}
