const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
require("./config/dbConnection");
const router = require("./routes");

const app = express();
const port = 4000;

app.use(express.json());

app.use(router);


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
