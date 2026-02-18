import sql from "../db/connection.js";
import behaviorEngine from "./behaviorEngine.js";

/**
 * RECOMMENDATION ENGINE
 * Generates personalized product recommendations
 * Based on user behavior, affinity scores, and collaborative filtering
 */

class RecommendationEngine {
  /**
   * Get personalized product recommendations for a user
   * @param {number} userId - User ID
   * @param {number} limit - Number of recommendations (default: 5)
   */
  async getRecommendations(userId, limit = 5) {
    try {
      // Get user AI profile
      const profile = await behaviorEngine.getUserProfile(userId);

      if (!profile) {
        // New user - return trending products
        return await this.getTrendingProducts(limit);
      }

      // Get recommendations based on different strategies
      const [affinityBased, categoryBased, priceBased, collaborative] =
        await Promise.all([
          this.getAffinityBasedRecommendations(userId, limit),
          this.getCategoryBasedRecommendations(
            userId,
            profile.favorite_category,
            limit,
          ),
          this.getPriceBasedRecommendations(
            userId,
            profile.price_sensitivity,
            limit,
          ),
          this.getCollaborativeRecommendations(userId, limit),
        ]);

      // Merge and score recommendations
      const recommendations = this.mergeRecommendations(
        [
          { products: affinityBased, weight: 0.4 },
          { products: categoryBased, weight: 0.3 },
          { products: priceBased, weight: 0.2 },
          { products: collaborative, weight: 0.1 },
        ],
        limit,
      );

      return recommendations;
    } catch (error) {
      console.error("Error getting recommendations:", error);
      return [];
    }
  }

  /**
   * Recommendations based on product affinity scores
   */
  async getAffinityBasedRecommendations(userId, limit) {
    try {
      // Get products user has shown interest in
      const affinities = await sql`
        SELECT pa.product_id, pa.affinity_score, p.*
        FROM product_affinities pa
        JOIN products p ON pa.product_id = p.id
        WHERE pa.user_id = ${userId}
        ORDER BY pa.affinity_score DESC, pa.last_viewed DESC
        LIMIT ${limit}
      `;

      // Find similar products in same categories
      if (affinities.length > 0) {
        const categoryIds = [...new Set(affinities.map((a) => a.category))];
        const viewedProductIds = affinities.map((a) => a.product_id);

        const similar = await sql`
          SELECT DISTINCT p.*, s.name as shop_name
          FROM products p
          JOIN shops s ON p.shop_id = s.id
          WHERE p.category = ANY(${categoryIds})
            AND p.id != ALL(${viewedProductIds})
            AND p.stock > 0
          ORDER BY p.created_at DESC
          LIMIT ${limit}
        `;

        return similar;
      }

      return [];
    } catch (error) {
      console.error("Error in affinity-based recommendations:", error);
      return [];
    }
  }

  /**
   * Recommendations based on favorite category
   */
  async getCategoryBasedRecommendations(userId, category, limit) {
    try {
      if (!category) return [];

      // Get user's viewed products to exclude them
      const viewed = await sql`
        SELECT DISTINCT product_id
        FROM analytics_events
        WHERE user_id = ${userId}
          AND product_id IS NOT NULL
      `;

      const viewedIds = viewed.map((v) => v.product_id);

      const products = await sql`
        SELECT p.*, s.name as shop_name, s.category
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE s.category = ${category}
          AND p.stock > 0
          ${viewedIds.length > 0 ? sql`AND p.id != ALL(${viewedIds})` : sql``}
        ORDER BY p.created_at DESC
        LIMIT ${limit}
      `;

      return products;
    } catch (error) {
      console.error("Error in category-based recommendations:", error);
      return [];
    }
  }

  /**
   * Recommendations based on price sensitivity
   */
  async getPriceBasedRecommendations(userId, priceSensitivity, limit) {
    try {
      // Define price ranges based on sensitivity
      const priceRanges = {
        low: { min: 1000000, max: 999999999 }, // > 1M IRR
        medium: { min: 300000, max: 1000000 }, // 300K-1M IRR
        high: { min: 0, max: 300000 }, // < 300K IRR
      };

      const range = priceRanges[priceSensitivity] || priceRanges.medium;

      const products = await sql`
        SELECT p.*, s.name as shop_name
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE p.base_price_irr >= ${range.min}
          AND p.base_price_irr <= ${range.max}
          AND p.stock > 0
        ORDER BY RANDOM()
        LIMIT ${limit}
      `;

      return products;
    } catch (error) {
      console.error("Error in price-based recommendations:", error);
      return [];
    }
  }

  /**
   * Collaborative filtering recommendations
   * Find products liked by similar users
   */
  async getCollaborativeRecommendations(userId, limit) {
    try {
      // Find users with similar behavior patterns
      const userProfile = await behaviorEngine.getUserProfile(userId);
      if (!userProfile) return [];

      const similarUsers = await sql`
        SELECT user_id
        FROM user_ai_profiles
        WHERE user_id != ${userId}
          AND favorite_category = ${userProfile.favorite_category}
          AND price_sensitivity = ${userProfile.price_sensitivity}
          AND ABS(intent_score - ${userProfile.intent_score}) < 0.3
        LIMIT 10
      `;

      if (similarUsers.length === 0) return [];

      const similarUserIds = similarUsers.map((u) => u.user_id);

      // Get products these similar users liked
      const products = await sql`
        SELECT p.*, s.name as shop_name, COUNT(*) as affinity_count
        FROM product_affinities pa
        JOIN products p ON pa.product_id = p.id
        JOIN shops s ON p.shop_id = s.id
        WHERE pa.user_id = ANY(${similarUserIds})
          AND p.stock > 0
          AND pa.product_id NOT IN (
            SELECT product_id FROM product_affinities WHERE user_id = ${userId}
          )
        GROUP BY p.id, s.name
        ORDER BY affinity_count DESC, p.created_at DESC
        LIMIT ${limit}
      `;

      return products;
    } catch (error) {
      console.error("Error in collaborative recommendations:", error);
      return [];
    }
  }

  /**
   * Get trending products (fallback for new users)
   */
  async getTrendingProducts(limit) {
    try {
      const products = await sql`
        SELECT p.*, s.name as shop_name, COUNT(ae.id) as view_count
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        LEFT JOIN analytics_events ae ON p.id = ae.product_id
        WHERE p.stock > 0
          AND ae.event_type = 'productView'
          AND ae.timestamp > NOW() - INTERVAL '7 days'
        GROUP BY p.id, s.name
        ORDER BY view_count DESC
        LIMIT ${limit}
      `;

      return products;
    } catch (error) {
      console.error("Error getting trending products:", error);
      return [];
    }
  }

  /**
   * Merge multiple recommendation sources with weighted scoring
   */
  mergeRecommendations(sources, limit) {
    const productScores = new Map();

    sources.forEach(({ products, weight }) => {
      products.forEach((product, index) => {
        const positionScore = (products.length - index) / products.length;
        const score = positionScore * weight;

        if (productScores.has(product.id)) {
          productScores.set(product.id, {
            ...product,
            score: productScores.get(product.id).score + score,
          });
        } else {
          productScores.set(product.id, {
            ...product,
            score,
          });
        }
      });
    });

    // Sort by score and return top N
    return Array.from(productScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
}

export default new RecommendationEngine();
