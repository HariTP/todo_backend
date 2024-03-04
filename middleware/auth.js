const jwt = require('jsonwebtoken');
const user = require('../models/users');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('authorization');
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: 'Unauthorized! No token provided' });
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized! No token provided' });
  }
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized! Invalid token' });
    }
    const valid_user = await user.findOne({user_id: decoded.user_id});
    if (valid_user) {
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized! Invalid token' });
    }
  });
}

module.exports = authMiddleware;
