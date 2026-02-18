/**
 * AI Service Integration
 * Helper functions for communicating with the AI microservice
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:4000";
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY || "dev-key";

/**
 * Make authenticated request to AI service
 */
async function callAIService(endpoint, options = {}) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": AI_SERVICE_API_KEY,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(
        `AI Service returned ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`AI Service error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Get personalized recommendations for a user
 * @param {number} userId - User ID
 * @param {number} limit - Number of recommendations (default: 5)
 */
export async function getRecommendations(userId, limit = 5) {
  try {
    const data = await callAIService(
      `/ai/recommendations/${userId}?limit=${limit}`,
    );
    return data.recommendations || [];
  } catch (error) {
    console.error("Failed to get recommendations:", error);
    return [];
  }
}

/**
 * Get vendor insights for a shop
 * @param {number} shopId - Shop ID
 */
export async function getVendorInsights(shopId) {
  try {
    const data = await callAIService(`/ai/vendor-insights/${shopId}`);
    return data.insights || null;
  } catch (error) {
    console.error("Failed to get vendor insights:", error);
    return null;
  }
}

/**
 * Get shop score and performance metrics
 * @param {number} shopId - Shop ID
 */
export async function getShopScore(shopId) {
  try {
    const data = await callAIService(`/ai/shop-score/${shopId}`);
    return data.score || null;
  } catch (error) {
    console.error("Failed to get shop score:", error);
    return null;
  }
}

/**
 * Get user AI profile
 * @param {number} userId - User ID
 */
export async function getUserAIProfile(userId) {
  try {
    const data = await callAIService(`/ai/user-profile/${userId}`);
    return data.profile || null;
  } catch (error) {
    console.error("Failed to get user AI profile:", error);
    return null;
  }
}

/**
 * Manually trigger user behavior processing
 * @param {number} userId - User ID
 */
export async function processUserBehavior(userId) {
  try {
    const data = await callAIService(`/ai/process-user/${userId}`, {
      method: "POST",
    });
    return data.profile || null;
  } catch (error) {
    console.error("Failed to process user behavior:", error);
    return null;
  }
}

/**
 * Get category leaderboard
 * @param {string} category - Category name
 * @param {number} limit - Number of results (default: 10)
 */
export async function getCategoryLeaderboard(category, limit = 10) {
  try {
    const data = await callAIService(
      `/ai/category-leaderboard/${category}?limit=${limit}`,
    );
    return data.leaderboard || [];
  } catch (error) {
    console.error("Failed to get category leaderboard:", error);
    return [];
  }
}

/**
 * Push event to AI service queue (in-memory for now)
 * In production, this would push to Redis
 * @param {Object} eventData - Event data
 */
export async function pushEventToAIQueue(eventData) {
  // For now, this is a placeholder
  // In production with Redis, you would:
  // await redis.rPush('analytics_events', JSON.stringify(eventData));

  // For development, you can log or skip
  console.log("Event queued for AI processing:", eventData.event_type);
}
