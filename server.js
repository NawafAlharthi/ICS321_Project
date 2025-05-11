const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db"); // Database connection pool
const apiRoutes = require("./routes/api"); // Import API routes

const app = express();

// Middleware
// Configure CORS more explicitly
const corsOptions = {
  origin: "http://localhost:5173", // Allow only the frontend origin
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions)); // Use configured CORS options

app.use(express.json()); // for parsing application/json

// API Routes
app.use("/api", apiRoutes); // Mount the API routes under /api prefix

// Basic root route (optional)
app.get("/", (req, res) => {
  res.send("Soccer App Backend is running! Access API at /api");
});

// Global error handler (basic example)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 5001;

// Test DB connection and start server
db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database on startup:", err);
    // Decide if server should start even if DB is down initially
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}, but DB connection FAILED.`);
    });
  } else {
    console.log("Successfully connected to the database.");
    connection.release(); // Release the test connection
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}, API available at /api`);
    });
  }
});
