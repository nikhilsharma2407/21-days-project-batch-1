const UserModel = require("../models/UserModel");
const { sanitizeUserData } = require("../utils");
const { generateToken } = require("../utils/jwtUtil");
const { verifyPassword, genPasswordHash } = require("../utils/passwordUtils");
const { generateQRcode, verifyOTP } = require("../utils/totpUtil");

const login = async (req, res) => {
  const { username, password } = req.body;
  //   db request
  const userData = await UserModel.findUser(username);
  console.log("🚀 ~ userData:", userData);

  if (!userData) {
    res.status(404);
    res.send("username doesn't exist");
  }

  const isPwdValid = await verifyPassword(password, userData.password);

  if (isPwdValid) {
    const token = generateToken(userData);
    res.cookie("authToken", token, { httpOnly: true, maxAge: 3600_000 });

    res.send({
      message: "Logged in successfully!!!",
      data: sanitizeUserData(userData),
    });
  } else {
    res.status(401);
    res.send("Invalid credentials");
  }
};

const signup = async (req, res) => {
  const userData = req.body;
  const { username, password } = userData;

  userData.password = await genPasswordHash(password);
  console.log("🚀 ~ userData:", userData);

  const { qrCodeImage, secret } = await generateQRcode(username);

  const data = await UserModel.createUser({ ...userData, secret });

  res.send(`<img src=${qrCodeImage}></img>`);
};

const logout = (req, res) => {
  res.clearCookie("authToken");
  res.send({ message: "Logged out successfully" });
};

const resetPassword = async (req, res, next) => {
  const { username, otp, password } = req.body;
  console.log("🚀 ~ resetPassword ~ otp:", otp)
  try {
    const userData = await UserModel.findUser(username);
    console.log("🚀 ~ resetPassword ~ userData:", userData)
    if (!userData) {
      res.status(404);
      return res.send("username doesn't exist");
    } else {
      const isValidOTP = verifyOTP(otp, userData.secret);
      if (isValidOTP) {
        const hashedPassword = await genPasswordHash(password);
        const data = await UserModel.findOneAndUpdate(
          { username },
          { password: hashedPassword }
        );
        res.send({ message: "Password reset successfully" });
      } else {
        res.status(401);
        return res.send("Invalid OTP");
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  signup,
  logout,
  resetPassword,
};
