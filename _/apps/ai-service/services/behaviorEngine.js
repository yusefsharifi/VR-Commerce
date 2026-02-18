import sql from "../db/connection.js";
import config from "../config/index.js";

/**
 * BEHAVIOR INTELLIGENCE ENGINE
 * Analyzes user behavior and computes intelligence scores
 * - Intent score: How likely user is to make a purchase
 * - Price sensitivity: User's price preference patterns
 * - Favorite category: Most viewed/purchased category
 * - Purchase probability: Likelihood of converting
 */

class BehaviorEngine {
  /**
   * Process user events and update AI profile
   * @param {number} userId - User ID to process
   */
  async processUserBehavior(userId) {
    try {
      // Get all user events from analytics
      const events = await sql`
        SELECT event_type, shop_id, product_id, timestamp
        FROM analytics_events
        WHERE user_id = ${userId}
        ORDER BY timestamp DESC
        LIMIT 1000
      `;

      if (events.length === 0) {
        return null;
      }

      // Calculate scores
      const intentScore = this.calculateIntentScore(events);
      const priceSensitivity = await this.calculatePriceSensitivity(
        userId,
        events,
      );
      const favoriteCategory = await this.calculateFavoriteCategory(userId);
      const purchaseProbability = this.calculatePurchaseProbability(events);

      // Upsert user AI profile
      const profile = await sql`
        INSERT INTO user_ai_profiles (
          user_id, 
          intent_score, 
          price_sensitivity, 
          favorite_category, 
          purchase_probability,
          total_events,
          last_activity,
          updated_at
        )
        VALUES (
          ${userId},
          ${intentScore},
          ${priceSensitivity},
          ${favoriteCategory},
          ${purchaseProbability},
          ${events.length},
          ${new Date()},
          ${new Date()}
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          intent_score = ${intentScore},
          price_sensitivity = ${priceSensitivity},
          favorite_category = ${favoriteCategory},
          purchase_probability = ${purchaseProbability},
          total_events = ${events.length},
          last_activity = ${new Date()},
          updated_at = ${new Date()}
        RETURNING *
      `;

      return profile[0];
    } catch (error) {
      console.error("Error processing user behavior:", error);
      throw error;
    }
  }

  /**
   * Calculate intent score based on event types
   * Higher score = higher purchase intent
   */
  calculateIntentScore(events) {
    const weights = config.scoring.intentWeights;
    let totalScore = 0;
    let weightedEvents = 0;

    events.forEach((event) => {
      const weight = weights[event.event_type] || 0.1;
      totalScore += weight;
      weightedEvents++;
    });

    // Normalize to 0-1 range
    const normalizedScore =
      weightedEvents > 0
        ? Math.min(totalScore / (weightedEvents * 1.5), 1.0)
        : 0;

    return parseFloat(normalizedScore.toFixed(2));
  }

  /**
   * Calculate price sensitivity based on viewed product prices
   * Returns: 'low', 'medium', or 'high'
   */
  async calculatePriceSensitivity(userId, events) {
    try {
      // Get product IDs from view events
      const productIds = events
        .filter((e) => e.event_type === "productView" && e.product_id)
        .map((e) => e.product_id)
        .slice(0, 50); // Last 50 viewed products

      if (productIds.length === 0) {
        return "medium";
      }

      // Get average price of viewed products
      const priceData = await sql`
        SELECT AVG(base_price_irr) as avg_price
        FROM products
        WHERE id = ANY(${productIds})
      `;

      const avgPrice = parseFloat(priceData[0]?.avg_price || 0);

      // Determine sensitivity based on thresholds
      if (avgPrice > config.scoring.priceSensitivity.low) {
        return "low"; // Views expensive items
      } else if (avgPrice > config.scoring.priceSensitivity.medium) {
        return "medium";
      } else {
        return "high"; // Views budget items
      }
    } catch (error) {
      console.error("Error calculating price sensitivity:", error);
      return "medium";
    }
  }

  /**
   * Calculate favorite category based on shop visits and product views
   */
  async calculateFavoriteCategory(userId) {
    try {
      const categoryData = await sql`
        SELECT s.category, COUNT(*) as visit_count
        FROM analytics_events ae
        JOIN shops s ON ae.shop_id = s.id
        WHERE ae.user_id = ${userId}
          AND ae.event_type IN ('shop_visit', 'productView')
        GROUP BY s.category
        ORDER BY visit_count DESC
        LIMIT 1
      `;

      return categoryData[0]?.category || null;
    } catch (error) {
      console.error("Error calculating favorite category:", error);
      return null;
    }
  }

  /**
   * Calculate purchase probability
   * Based on cart additions, repeat visits, and browsing depth
   */
  calculatePurchaseProbability(events) {
    const recentEvents = events.slice(0, 100);

    // Count different event types
    const cartAdds = recentEvents.filter(
      (e) => e.event_type === "addToCart",
    ).length;
    const purchases = recentEvents.filter(
      (e) => e.event_type === "purchase",
    ).length;
    const visits = recentEvents.filter(
      (e) => e.event_type === "shop_visit",
    ).length;
    const views = recentEvents.filter(
      (e) => e.event_type === "productView",
    ).length;

    // Calculate probability components
    const cartScore =
      Math.min(cartAdds / 10, 1.0) *
      config.scoring.purchaseProbability.cartToCheckout;
    const repeatScore =
      Math.min(visits / 20, 1.0) *
      config.scoring.purchaseProbability.repeatVisits;
    const browsingScore =
      Math.min(views / 50, 1.0) *
      config.scoring.purchaseProbability.browsingDepth;

    // Boost if user has purchased before
    const purchaseBoost = purchases > 0 ? 0.2 : 0;

    const probability = Math.min(
      cartScore + repeatScore + browsingScore + purchaseBoost,
      1.0,
    );

    return parseFloat(probability.toFixed(2));
  }

  /**
   * Update product affinity for a user
   * Tracks which products user is interested in
   */
  async updateProductAffinity(userId, productId, eventType) {
    try {
      // Calculate affinity boost based on event type
      const affinityBoost =
        {
          productView: 0.1,
          addToCart: 0.3,
          purchase: 1.0,
        }[eventType] || 0.05;

      await sql`
        INSERT INTO product_affinities (user_id, product_id, affinity_score, view_count, last_viewed)
        VALUES (${userId}, ${productId}, ${affinityBoost}, 1, ${new Date()})
        ON CONFLICT (user_id, product_id)
        DO UPDATE SET
          affinity_score = LEAST(product_affinities.affinity_score + ${affinityBoost}, 1.0),
          view_count = product_affinities.view_count + 1,
          last_viewed = ${new Date()}
      `;
    } catch (error) {
      console.error("Error updating product affinity:", error);
    }
  }

  /**
   * Get user AI profile
   */
  async getUserProfile(userId) {
    try {
      const profile = await sql`
        SELECT * FROM user_ai_profiles
        WHERE user_id = ${userId}
      `;

      return profile[0] || null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      return null;
    }
  }
}

export default new BehaviorEngine();
