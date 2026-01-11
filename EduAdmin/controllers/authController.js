const { verifyToken } = require("../utils/jwtUtil");

const authController = (req, res, next) => {
  const { authToken } = req.cookies;
  const userData = verifyToken(authToken);
  // res.local placeholder to store data between middlewares
  res.locals.user = userData;
  next();
};

module.exports = authController;
