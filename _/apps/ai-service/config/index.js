import dotenv from "dotenv";
dotenv.config();

/**
 * Centralized configuration for AI Service
 * All environment variables and settings are managed here
 */
export default {
  // Server settings
  port: process.env.PORT || 4000,
  env: process.env.NODE_ENV || "development",

  // Database connection
  database: {
    url: process.env.DATABASE_URL,
  },

  // Redis configuration
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    queueName: process.env.REDIS_QUEUE_NAME || "analytics_events",
  },

  // Security
  apiKey: process.env.AI_SERVICE_API_KEY,

  // Core backend API
  coreApiUrl: process.env.CORE_API_URL || "http://localhost:3000",

  // AI Processing settings
  processing: {
    batchSize: parseInt(process.env.BATCH_SIZE) || 100,
    intervalMs: parseInt(process.env.PROCESS_INTERVAL_MS) || 30000, // 30 seconds
  },

  // Scoring thresholds and weights
  scoring: {
    // Intent score calculation weights
    intentWeights: {
      productView: 0.3,
      addToCart: 0.5,
      purchase: 1.0,
      shopVisit: 0.2,
    },

    // Price sensitivity thresholds (based on average product price viewing)
    priceSensitivity: {
      low: 1000000, // Views products > 1M IRR
      medium: 500000, // Views products 500K-1M IRR
      high: 500000, // Views products < 500K IRR
    },

    // Purchase probability thresholds
    purchaseProbability: {
      cartToCheckout: 0.4,
      repeatVisits: 0.3,
      browsingDepth: 0.3,
    },
  },
};
