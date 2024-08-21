const express = require("express");
const app = express();

app.get("/advice", (req, res) => {
  res.send("Probe the lobe the globe \n -Bhanu Teja");
});

app.listen(3000, () => {
  console.log("port 3000s");
});

module.exports = app;
