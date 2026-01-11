const express = require("express");
const {
  signup,
  login,
  logout,
  resetPassword,
} = require("../controllers/userController");
const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);

userRouter.patch("/reset-password", resetPassword);
userRouter.get("/logout", logout);

module.exports = userRouter;
