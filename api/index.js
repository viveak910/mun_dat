const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

const uri = process.env.DATABASE;
if (!uri) {
  console.error("Missing DATABASE environment variable");
  process.exit(1);
}

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
    console.log("✅ Connected to MongoDB!");
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB", error);
    process.exit(1);
  }
}

connectToMongoDB();

// Dynamic collection reference (ensures fresh connections)
function getCollections() {
  const database = client.db("MUN");
  return {
    registrationsCollection: database.collection("Registrations"),
    upiCollection: database.collection("UPI_IDs"),
  };
}

// 🔹 Insert new UPI IDs
app.post("/upi/add", async (req, res) => {
  try {
    const { upiCollection } = getCollections();
    const { upiData, recipient } = req.body;
    
    const result = await upiCollection.insertOne({ upiData, recipient, count: 0 });
    res.status(201).json({ message: "UPI ID added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error adding UPI ID:", error);
    res.status(500).json({ error: "Error adding UPI ID" });
  }
});

// 🔹 Get all registrations
app.get("/registrations", async (req, res) => {
  try {
    const { registrationsCollection } = getCollections();
    const registrations = await registrationsCollection.find({}).toArray();
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).json({ error: "Error fetching registrations" });
  }
});

// 🔹 Get an available UPI ID (count < 20)
app.get("/upi/available", async (req, res) => {
  try {
    const { upiCollection } = getCollections();
    let upi = await upiCollection.findOne({ count: { $lt: 20 } });

    if (!upi) {
      await upiCollection.updateMany({}, { $set: { count: 0 } });
      upi = await upiCollection.findOne({});
    }

    res.json(upi);
  } catch (error) {
    console.error("Error fetching UPI ID:", error);
    res.status(500).json({ error: "Error fetching UPI ID" });
  }
});

// 🔹 Register a new user and update UPI count
app.post("/register", async (req, res) => {
  try {
    const { registrationsCollection, upiCollection } = getCollections();
    const registrationData = req.body;
    const { upiData } = registrationData;

    const upi = await upiCollection.findOne({ upiData });
    if (!upi) return res.status(400).json({ error: "UPI ID not found" });

    await registrationsCollection.insertOne(registrationData);
    await upiCollection.updateOne({ upiData }, { $inc: { count: 1 } });

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user" });
  }
});

// 🔹 Handle Vercel's serverless functions
module.exports = app;

if (process.env.NODE_ENV !== "vercel") {
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}
