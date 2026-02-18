import express from "express";
import cors from "cors";
import config from "./config/index.js";
import { initializeDatabase } from "./db/connection.js";
import { initializeRedis } from "./db/redis.js";
import routes from "./routes/index.js";

/**
 * AI SERVICE SERVER
 * Main entry point for the AI microservice
 */

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Trust proxy for rate limiting
app.set("trust proxy", 1);

// Routes
app.use("/", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

/**
 * Initialize services and start server
 */
async function startServer() {
  try {
    console.log("========================================");
    console.log("Passage 414 - AI Service");
    console.log("========================================");
    console.log(`Environment: ${config.env}`);
    console.log(`Port: ${config.port}`);
    console.log("");

    // Initialize database
    console.log("Initializing database...");
    await initializeDatabase();

    // Initialize Redis queue
    console.log("Initializing queue system...");
    await initializeRedis();

    // Start HTTP server
    app.listen(config.port, () => {
      console.log("");
      console.log("========================================");
      console.log(`✓ AI Service running on port ${config.port}`);
      console.log("========================================");
      console.log("");
      console.log("Available endpoints:");
      console.log(`  GET  /health`);
      console.log(`  GET  /ai/recommendations/:userId`);
      console.log(`  GET  /ai/vendor-insights/:shopId`);
      console.log(`  GET  /ai/shop-score/:shopId`);
      console.log(`  GET  /ai/user-profile/:userId`);
      console.log(`  POST /ai/process-user/:userId`);
      console.log(`  GET  /ai/category-leaderboard/:category`);
      console.log("");
      console.log("Note: All endpoints require X-API-Key header");
      console.log("========================================");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down AI Service...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down AI Service...");
  process.exit(0);
});

// Start the server
startServer();
