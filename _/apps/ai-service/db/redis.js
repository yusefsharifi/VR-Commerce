import config from "../config/index.js";

/**
 * Simple Redis client wrapper
 * Since redis package might not be available, this is a stub implementation
 * In production, replace with actual Redis client
 */

class SimpleQueue {
  constructor() {
    this.queue = [];
    this.isConnected = false;
  }

  async connect() {
    console.log("⚠ Using in-memory queue (Redis not available)");
    console.log("⚠ For production, ensure Redis is properly configured");
    this.isConnected = true;
  }

  async push(data) {
    this.queue.push(data);
  }

  async pop() {
    return this.queue.shift() || null;
  }

  async length() {
    return this.queue.length;
  }

  async quit() {
    this.isConnected = false;
  }
}

let queueClient = null;

export async function initializeRedis() {
  try {
    queueClient = new SimpleQueue();
    await queueClient.connect();
    console.log("✓ Queue system initialized");
    return queueClient;
  } catch (error) {
    console.error("✗ Queue initialization error:", error);
    throw error;
  }
}

export function getRedisClient() {
  if (!queueClient) {
    throw new Error("Queue client not initialized");
  }
  return queueClient;
}

export async function pushEventToQueue(eventData) {
  try {
    const client = getRedisClient();
    await client.push(JSON.stringify(eventData));
  } catch (error) {
    console.error("Error pushing event to queue:", error);
    throw error;
  }
}

export async function popEventFromQueue() {
  try {
    const client = getRedisClient();
    const event = await client.pop();
    return event ? JSON.parse(event) : null;
  } catch (error) {
    console.error("Error popping event from queue:", error);
    return null;
  }
}

export async function getQueueLength() {
  try {
    const client = getRedisClient();
    return await client.length();
  } catch (error) {
    console.error("Error getting queue length:", error);
    return 0;
  }
}

export async function closeRedis() {
  if (queueClient) {
    await queueClient.quit();
    console.log("✓ Queue connection closed");
  }
}

export default {
  initialize: initializeRedis,
  getClient: getRedisClient,
  pushEvent: pushEventToQueue,
  popEvent: popEventFromQueue,
  getQueueLength,
  close: closeRedis,
};
