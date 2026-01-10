const { generateToken } = require("./jwtUtil");
const { genPasswordHash, verifyPassword } = require("./passwordUtils");
const { sanitizeUserData } = require("./utils");

const express = require("express");
const router = express.Router();

const userDetails = [
  {
    username: "nikhil101",
    name: "Nikhil",
    email: "test@gmail.com",
    password: "$2b$10$cJcfjvJeMGNgGVP.xpk/PeWIbl4gGycI.ehE3ZNlMmOYl.ArFczHe",
    cart: [],
  },
];

router.get("/", (req, res) => {
  res.send({ status: "API is running" });
});

router.post("/signup", async (req, res) => {
  const userData = req.body;
  const { username, password } = userData;

  userData.password = await genPasswordHash(password);
  console.log("🚀 ~ userData:", userData);

  userDetails.push(userData);

  res.send({
    data: userData,
    message: `${username} signed up successfully!!!`,
  });
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  //   db request
  const userData = userDetails.find((user) => user.username === username);
  console.log("🚀 ~ userData:", userData);

  if (!userData) {
    res.status(404);
    res.send("username doesn't exist");
  }

  const isPwdValid = await verifyPassword(password, userData.password);

  if (isPwdValid) {
    const token = generateToken(userData, "30s");
    res.cookie("authToken", token, { httpOnly: true, maxAge: 3600_000 });

    res.send({
      message: "Logged in successfully!!!",
      data: sanitizeUserData(userData),
    });
  } else {
    res.status(401);
    res.send("Invalid credentials");
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.send({ message: "Logged out successfully!!!" });
});

module.exports = router;
