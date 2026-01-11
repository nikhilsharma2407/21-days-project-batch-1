const { sign, verify } = require("jsonwebtoken");

const SECRET_KEY = "MY_SECRET_KEY";

const generateToken = (userdata, time = "1h") => {
  console.log("🚀 ~ generateToken ~ userdata:", userdata)
  const token = sign(userdata, SECRET_KEY, { expiresIn: time });
  console.log("🚀 ~ generateToken ~ token:", token);
  return token;
};

const verifyToken = (token) => {
  if (!token) {
    const error = new Error("Please login to access this resource");
    error.status = 401;
    throw error;
  }
  const decoded = verify(token, SECRET_KEY);
  return decoded;
};

module.exports = { generateToken, verifyToken };
