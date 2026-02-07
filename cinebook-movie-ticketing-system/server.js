const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config();
require("./config/dbConnection");
const router = require("./routes");

const app = express();
const port = 4000;
app.use(express.json());

app.use(router);
app.use("/", express.static(path.join(__dirname, "dist")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// errorHandler
app.use((err, req, res, next) => {
  console.log(err);
  console.error(err.stack);
  res.status(err.status || 500).send({ error: err.message });
});

app.listen(port, () => {
  console.clear();
  console.log(`Example app listening on port ${port}!`);
});
