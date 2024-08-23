const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// MongoDB connection URI
const uri =
  "mongodb+srv://bhanutejavaravenkatareddy:hU3uciRBIaMDvzXM@cluster0.erthl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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

// GET API endpoint to fetch all registrations
app.get("/registrations", async (req, res) => {
  try {
    const database = client.db("MUN");
    const registrationsCollection = database.collection("Registrations");

    // Fetch all documents from the Registrations collection
    const registrations = await registrationsCollection.find({}).toArray();

    // Send the documents as a JSON response
    res.json(registrations);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    res.status(500).send("Error fetching registrations");
  }
});

// POST API endpoint to add a new registration
app.post("/registrations", async (req, res) => {
  try {
    const database = client.db("MUN");
    const registrationsCollection = database.collection("Registrations");

    // Extract new registration data from the request body
    const newRegistration = req.body;

    // Insert the new registration into the collection
    const result = await registrationsCollection.insertOne(newRegistration);

    // Send a response with the inserted document's ID
    res.status(201).json({
      message: "Registration added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding registration:", error);
    res.status(500).send("Error adding registration");
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
