import { initializeDatabase } from "../db/connection.js";
import {
  initializeRedis,
  popEventFromQueue,
  getQueueLength,
} from "../db/redis.js";
import behaviorEngine from "../services/behaviorEngine.js";
import trafficAnalysis from "../services/trafficAnalysis.js";
import config from "../config/index.js";

/**
 * BACKGROUND EVENT PROCESSOR
 * Consumes analytics events from Redis queue
 * Processes events to update AI profiles and metrics
 */

class EventProcessor {
  constructor() {
    this.isRunning = false;
    this.processedCount = 0;
    this.errorCount = 0;
  }

  /**
   * Start the event processor
   */
  async start() {
    console.log("========================================");
    console.log("AI Service Event Processor");
    console.log("========================================");

    try {
      // Initialize database and Redis
      await initializeDatabase();
      await initializeRedis();

      this.isRunning = true;
      console.log("✓ Event processor started");
      console.log(`  Batch size: ${config.processing.batchSize}`);
      console.log(`  Process interval: ${config.processing.intervalMs}ms`);

      // Start processing loop
      this.processLoop();
    } catch (error) {
      console.error("✗ Failed to start event processor:", error);
      process.exit(1);
    }
  }

  /**
   * Main processing loop
   * Runs continuously, processing events in batches
   */
  async processLoop() {
    while (this.isRunning) {
      try {
        const queueLength = await getQueueLength();

        if (queueLength > 0) {
          console.log(
            `\n[${new Date().toISOString()}] Processing ${queueLength} events...`,
          );

          const batchSize = Math.min(queueLength, config.processing.batchSize);
          await this.processBatch(batchSize);

          console.log(
            `✓ Processed ${this.processedCount} total events (${this.errorCount} errors)`,
          );
        }

        // Wait before next batch
        await new Promise((resolve) =>
          setTimeout(resolve, config.processing.intervalMs),
        );
      } catch (error) {
        console.error("Error in process loop:", error);
        this.errorCount++;
      }
    }
  }

  /**
   * Process a batch of events
   */
  async processBatch(batchSize) {
    const promises = [];

    for (let i = 0; i < batchSize; i++) {
      promises.push(this.processNextEvent());
    }

    await Promise.allSettled(promises);
  }

  /**
   * Process a single event from the queue
   */
  async processNextEvent() {
    try {
      const event = await popEventFromQueue();

      if (!event) {
        return;
      }

      const { user_id, event_type, shop_id, product_id } = event;

      // Update product affinity if applicable
      if (
        user_id &&
        product_id &&
        ["productView", "addToCart", "purchase"].includes(event_type)
      ) {
        await behaviorEngine.updateProductAffinity(
          user_id,
          product_id,
          event_type,
        );
      }

      // Update user AI profile periodically or on important events
      if (user_id && this.shouldUpdateUserProfile(event_type)) {
        await behaviorEngine.processUserBehavior(user_id);
      }

      // Update shop metrics periodically
      if (shop_id && this.shouldUpdateShopMetrics(event_type)) {
        await trafficAnalysis.calculateShopScore(shop_id);
      }

      this.processedCount++;
    } catch (error) {
      console.error("Error processing event:", error);
      this.errorCount++;
    }
  }

  /**
   * Determine if user profile should be updated
   * Update on important events or periodically
   */
  shouldUpdateUserProfile(eventType) {
    // Always update on purchases and cart additions
    if (eventType === "purchase" || eventType === "addToCart") {
      return true;
    }

    // Periodically update on other events (10% chance)
    return Math.random() < 0.1;
  }

  /**
   * Determine if shop metrics should be updated
   */
  shouldUpdateShopMetrics(eventType) {
    // Update on shop visits
    if (eventType === "shop_visit") {
      return true;
    }

    // Periodically update on other events (5% chance)
    return Math.random() < 0.05;
  }

  /**
   * Stop the event processor
   */
  async stop() {
    console.log("\nStopping event processor...");
    this.isRunning = false;
  }

  /**
   * Get processor statistics
   */
  getStats() {
    return {
      processedCount: this.processedCount,
      errorCount: this.errorCount,
      successRate:
        this.processedCount > 0
          ? (
              ((this.processedCount - this.errorCount) / this.processedCount) *
              100
            ).toFixed(2) + "%"
          : "N/A",
    };
  }
}

// Start processor
const processor = new EventProcessor();

// Handle shutdown signals
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT signal");
  await processor.stop();
  console.log("Final stats:", processor.getStats());
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM signal");
  await processor.stop();
  console.log("Final stats:", processor.getStats());
  process.exit(0);
});

// Start the processor
processor.start();
