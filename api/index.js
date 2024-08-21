const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");

const app = express();

const uri =
  "mongodb+srv://bhanutejavaravenkatareddy:gmeyk55gg0Rwy7Nn@cluster0.erthl.mongodb.net/MUN?retryWrites=true&w=majority";

app.use(express.json());
app.use(cors());

let db;
let collection;

MongoClient.connect(uri)
  .then((client) => {
    console.log("Connected to MongoDB Atlas");
    db = client.db("MUN");
    collection = db.collection("Registrations");
  })
  .catch((err) => console.error("Failed to connect to MongoDB Atlas", err));

app.post("/registration", (req, res) => {
  const registrationData = req.body;

  collection
    .insertOne(registrationData)
    .then(() => {
      res.status(201).send("Registration data saved successfully!");
    })
    .catch((error) => {
      console.error("Error saving registration data", error);
      res.status(500).send("Error saving registration data");
    });
});

app.get("/advice", (req, res) => {
  res.send("Probe around globe to lobe -Bhanu Teja");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;
