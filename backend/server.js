import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Import routes
import dragonRoutes from "./routes/dragon.route.js";
import dragonAcquisitionRoutes from "./routes/dragonAcquisition.routes.js";
import userRoutes from "./routes/user.routes.js"; // New import
import dragonkeeperRoutes from "./routes/dragonkeeper.routes.js";
import fightRoutes from "./routes/fight.routes.js";

// Import other routes as needed...

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use("/api/users", userRoutes);
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Routes
app.use("/api/dragons", dragonRoutes);
app.use("/api/acquire", dragonAcquisitionRoutes);
// Add other routes as needed...
app.use("/api", dragonkeeperRoutes);

app.use("/api/fights", fightRoutes);

// Base route for testing API
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to database then start server
connectDB().then(async () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
