const WebSocket = require('ws');
const { MongoClient } = require('mongodb');

// MongoDB connection URI and database/collection names
const MONGO_URI = "mongodb+srv://snehithakommasani:OwtP0CanIlh9O5hD@chatapp.m8qkf.mongodb.net/?retryWrites=true&w=majority&appName=chatApp";
const DB_NAME = "chatApp";
const COLLECTION_NAME = "messages";

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Connect to MongoDB
let db, messagesCollection;
MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(DB_NAME);
    messagesCollection = db.collection(COLLECTION_NAME);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

// Handle WebSocket connections
wss.on('connection', async (ws) => {
  console.log("New client connected");

  // Fetch and send previous chat messages to the newly connected client
  try {
    const previousMessages = await messagesCollection.find().toArray();
    ws.send(JSON.stringify(previousMessages));
  } catch (err) {
    console.error("Error fetching chat history:", err);
  }

  // Handle incoming messages
  ws.on('message', async (message) => {
    try {
      // Save the new message to the database
      await messagesCollection.insertOne({ text: message, timestamp: new Date() });

      // Broadcast the message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  ws.on('close', () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is running on port 8080");
