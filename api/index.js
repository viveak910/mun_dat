const express = require("express");
const app = express();

app.get("/invite", (req, res) => {
  res.send("Hello Bhanu");
});

app.listen(3000, () => {
  console.log("port 3000s");
});

module.exports = app;
