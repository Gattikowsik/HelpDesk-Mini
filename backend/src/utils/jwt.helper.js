const jwt = require('jsonwebtoken');

exports.generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role: role }, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token expires in 1 day
  });
};