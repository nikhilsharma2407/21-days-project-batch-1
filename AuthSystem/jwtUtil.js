const { sign, verify } = require("jsonwebtoken");

const SECRET_KEY = "MY_SECRET_KEY";

const generateToken = (userdata, time = "1h") => {
  const token = sign(userdata, SECRET_KEY, { expiresIn: time });
  console.log("🚀 ~ generateToken ~ token:", token);
  return token;
};

const verifyToken = (token) => {
  if (!token) {
    throw new Error("Token is required for verification");
  }
  const decoded = verify(token, SECRET_KEY);
  return decoded;
};

module.exports = { generateToken, verifyToken };
