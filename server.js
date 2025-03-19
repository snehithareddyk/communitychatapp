const WebSocket = require("ws");
const { MongoClient } = require("mongodb");

// MongoDB Connection Configuration
const MONGO_URI = "mongodb+srv://snehithakommasani:OwtP0CanIlh9O5hD@chatapp.m8qkf.mongodb.net/?retryWrites=true&w=majority&appName=chatApp"; // Replace with your actual URI
const DB_NAME = "chatApp";
const COLLECTION_NAME = "messages";

let db, messagesCollection;

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    messagesCollection = db.collection(COLLECTION_NAME);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

// Initialize MongoDB connection
connectToMongoDB();

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", async (ws) => {
  console.log("New client connected");

  // Fetch and send chat history
  try {
    const history = await messagesCollection.find({}).toArray();
    history.forEach((message) => {
      ws.send(message.content); // Assuming `content` is the field storing the message
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
  }

  // Handle incoming messages
  ws.on("message", async (data) => {
    console.log("Received:", data);

    try {
      // Save message to MongoDB
      await messagesCollection.insertOne({ content: data, timestamp: new Date() });

      // Broadcast message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(data);
        }
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on port 8080");
