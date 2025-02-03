const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const uri =process.env.DATABASE;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

connectToMongoDB();

app.get("/registrations", async (req, res) => {
  try {
    const database = client.db("MUN");
    const registrationsCollection = database.collection("Registrations");

    const registrations = await registrationsCollection.find({}).toArray();

    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).send("Error fetching registrations");
  }
});

app.post("/register", async (req, res) => {
  try {
    const database = client.db("MUN");
    const registrationsCollection = database.collection("Registrations");
    const newRegistration = req.body;
    const result = await registrationsCollection.insertOne(newRegistration);

    res.status(201).json({
      message: "Registration added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding registration:", error);
    res.status(500).send("Error adding registration");
  }
});
app.listen(port, () => {});
