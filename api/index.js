const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const app = express();
const port = 3000;
app.use(cors({ origin: '*' }));
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
const database = client.db("MUN");
const registrationsCollection = database.collection("Registrations");
const upiCollection = database.collection("UPI_IDs");

// Insert new UPI IDs
app.post("/upi/add", async (req, res) => {
  try {
    const { upiData, recipient } = req.body;
    const result = await upiCollection.insertOne({ upiData, recipient, count: 0 });
    res.status(201).json({ message: "UPI ID added successfully", id: result.insertedId });
  } catch (error) {
    console.error("Error adding UPI ID:", error);
    res.status(500).send("Error adding UPI ID");
  }
});
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

// Get an available UPI ID (count < 20)
app.get("/upi/available", async (req, res) => {
  try {
    let upi = await upiCollection.findOne({ count: { $lt: 20 } });
    
    if (!upi) {
      await upiCollection.updateMany({}, { $set: { count: 0 } });
      upi = await upiCollection.findOne({});
    }
    
    res.json(upi);
  } catch (error) {
    console.error("Error fetching UPI ID:", error);
    res.status(500).send("Error fetching UPI ID");
  }
});

// Register a new user and update UPI ID count
app.post("/register", async (req, res) => {
  try {
    const registrationData = req.body;
    const { upiData } = registrationData;
    
    const upi = await upiCollection.findOne({ upiData });
    if (!upi) return res.status(400).send("UPI ID not found");
    
    await registrationsCollection.insertOne(registrationData);
    await upiCollection.updateOne({ upiData}, { $inc: { count: 1 } });
    
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));