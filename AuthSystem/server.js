const express = require("express");
const router = require("./router");
const app = express();
const port = 4000;
const cookieParser = require("cookie-parser");
const cartRouter = require("./cartRouter");
const authController = require("./authController");

app.use(cookieParser());
app.use(express.json());

app.use("/user", router);
app.use("/cart", cartRouter);

// RBAC - Role Based Access Control
//app.use("/admin",authController ,adminRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
