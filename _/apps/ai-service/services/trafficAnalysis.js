import sql from "../db/connection.js";

/**
 * TRAFFIC ANALYSIS ENGINE
 * Analyzes shop traffic patterns and computes performance scores
 * - Traffic score: Overall visitor volume and growth
 * - Engagement score: How users interact with the shop
 * - Category ranking: Shop's position within its category
 */

class TrafficAnalysis {
  /**
   * Calculate comprehensive shop score
   * @param {number} shopId - Shop ID
   */
  async calculateShopScore(shopId) {
    try {
      const [trafficScore, engagementScore, categoryRanking] =
        await Promise.all([
          this.calculateTrafficScore(shopId),
          this.calculateEngagementScore(shopId),
          this.calculateCategoryRanking(shopId),
        ]);

      // Update shop AI metrics table
      await sql`
        INSERT INTO shop_ai_metrics (
          shop_id,
          traffic_score,
          engagement_score,
          category_ranking,
          updated_at
        )
        VALUES (
          ${shopId},
          ${trafficScore.score},
          ${engagementScore.score},
          ${categoryRanking.rank},
          ${new Date()}
        )
        ON CONFLICT (shop_id)
        DO UPDATE SET
          traffic_score = ${trafficScore.score},
          engagement_score = ${engagementScore.score},
          category_ranking = ${categoryRanking.rank},
          updated_at = ${new Date()}
      `;

      return {
        shopId,
        traffic: trafficScore,
        engagement: engagementScore,
        ranking: categoryRanking,
        overallScore: parseFloat(
          ((trafficScore.score + engagementScore.score) / 2).toFixed(2),
        ),
        calculatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error calculating shop score:", error);
      throw error;
    }
  }

  /**
   * Calculate traffic score
   * Based on visitor volume, growth, and unique visitors
   */
  async calculateTrafficScore(shopId) {
    try {
      // Get traffic metrics for last 30 days
      const currentPeriod = await sql`
        SELECT
          COUNT(*) as total_visits,
          COUNT(DISTINCT user_id) as unique_visitors
        FROM analytics_events
        WHERE shop_id = ${shopId}
          AND event_type = 'shop_visit'
          AND timestamp > NOW() - INTERVAL '30 days'
      `;

      // Get traffic for previous 30 days (for growth calculation)
      const previousPeriod = await sql`
        SELECT
          COUNT(*) as total_visits
        FROM analytics_events
        WHERE shop_id = ${shopId}
          AND event_type = 'shop_visit'
          AND timestamp BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
      `;

      const currentVisits = parseInt(currentPeriod[0]?.total_visits || 0);
      const previousVisits = parseInt(previousPeriod[0]?.total_visits || 0);
      const uniqueVisitors = parseInt(currentPeriod[0]?.unique_visitors || 0);

      // Calculate growth rate
      const growthRate =
        previousVisits > 0
          ? ((currentVisits - previousVisits) / previousVisits) * 100
          : 0;

      // Calculate score (0-100)
      // Base score from visit volume (max 50 points)
      const volumeScore = Math.min((currentVisits / 100) * 50, 50);

      // Growth bonus (max 30 points)
      const growthScore = Math.min((Math.max(growthRate, 0) / 100) * 30, 30);

      // Unique visitor ratio (max 20 points)
      const uniqueRatio =
        currentVisits > 0 ? uniqueVisitors / currentVisits : 0;
      const uniqueScore = uniqueRatio * 20;

      const totalScore = parseFloat(
        (volumeScore + growthScore + uniqueScore).toFixed(2),
      );

      return {
        score: totalScore,
        visits: currentVisits,
        uniqueVisitors,
        growthRate: parseFloat(growthRate.toFixed(2)),
        period: "30 days",
      };
    } catch (error) {
      console.error("Error calculating traffic score:", error);
      return { score: 0, visits: 0, uniqueVisitors: 0, growthRate: 0 };
    }
  }

  /**
   * Calculate engagement score
   * Based on user interactions and session depth
   */
  async calculateEngagementScore(shopId) {
    try {
      const metrics = await sql`
        SELECT
          COUNT(CASE WHEN event_type = 'shop_visit' THEN 1 END) as visits,
          COUNT(CASE WHEN event_type = 'productView' THEN 1 END) as product_views,
          COUNT(CASE WHEN event_type = 'addToCart' THEN 1 END) as cart_adds,
          COUNT(DISTINCT user_id) as unique_users
        FROM analytics_events
        WHERE shop_id = ${shopId}
          AND timestamp > NOW() - INTERVAL '30 days'
      `;

      const visits = parseInt(metrics[0]?.visits || 0);
      const productViews = parseInt(metrics[0]?.product_views || 0);
      const cartAdds = parseInt(metrics[0]?.cart_adds || 0);
      const uniqueUsers = parseInt(metrics[0]?.unique_users || 0);

      // Calculate engagement metrics
      const avgProductViewsPerVisit = visits > 0 ? productViews / visits : 0;
      const cartAddRate = productViews > 0 ? cartAdds / productViews : 0;
      const returnVisitorRate =
        visits > 0 && uniqueUsers > 0 ? (visits - uniqueUsers) / visits : 0;

      // Calculate score (0-100)
      // Product views per visit (max 40 points)
      const viewsScore = Math.min(avgProductViewsPerVisit * 10, 40);

      // Cart add rate (max 40 points)
      const cartScore = cartAddRate * 100 * 0.4;

      // Return visitor bonus (max 20 points)
      const returnScore = returnVisitorRate * 20;

      const totalScore = parseFloat(
        (viewsScore + cartScore + returnScore).toFixed(2),
      );

      return {
        score: totalScore,
        avgProductViewsPerVisit: parseFloat(avgProductViewsPerVisit.toFixed(2)),
        cartAddRate: parseFloat((cartAddRate * 100).toFixed(2)),
        returnVisitorRate: parseFloat((returnVisitorRate * 100).toFixed(2)),
      };
    } catch (error) {
      console.error("Error calculating engagement score:", error);
      return {
        score: 0,
        avgProductViewsPerVisit: 0,
        cartAddRate: 0,
        returnVisitorRate: 0,
      };
    }
  }

  /**
   * Calculate shop's ranking within its category
   */
  async calculateCategoryRanking(shopId) {
    try {
      // Get shop category
      const shop = await sql`
        SELECT category FROM shops WHERE id = ${shopId}
      `;

      if (!shop[0]) {
        return { rank: null, total: 0, category: null };
      }

      const category = shop[0].category;

      // Rank shops by traffic in the same category
      const ranking = await sql`
        WITH shop_traffic AS (
          SELECT
            s.id,
            s.name,
            COUNT(ae.id) as visit_count
          FROM shops s
          LEFT JOIN analytics_events ae ON s.id = ae.shop_id
          WHERE s.category = ${category}
            AND (ae.event_type = 'shop_visit' OR ae.event_type IS NULL)
            AND (ae.timestamp > NOW() - INTERVAL '30 days' OR ae.timestamp IS NULL)
          GROUP BY s.id, s.name
        )
        SELECT
          id,
          name,
          visit_count,
          RANK() OVER (ORDER BY visit_count DESC) as rank
        FROM shop_traffic
      `;

      const shopRanking = ranking.find((r) => r.id === shopId);

      return {
        rank: shopRanking ? parseInt(shopRanking.rank) : null,
        total: ranking.length,
        category,
        visits: shopRanking ? parseInt(shopRanking.visit_count) : 0,
      };
    } catch (error) {
      console.error("Error calculating category ranking:", error);
      return { rank: null, total: 0, category: null, visits: 0 };
    }
  }

  /**
   * Get leaderboard for a category
   */
  async getCategoryLeaderboard(category, limit = 10) {
    try {
      const leaderboard = await sql`
        SELECT
          s.id,
          s.name,
          COUNT(ae.id) as visits,
          sam.traffic_score,
          sam.engagement_score
        FROM shops s
        LEFT JOIN analytics_events ae ON s.id = ae.shop_id AND ae.event_type = 'shop_visit'
        LEFT JOIN shop_ai_metrics sam ON s.id = sam.shop_id
        WHERE s.category = ${category}
          AND (ae.timestamp > NOW() - INTERVAL '30 days' OR ae.timestamp IS NULL)
        GROUP BY s.id, s.name, sam.traffic_score, sam.engagement_score
        ORDER BY visits DESC, sam.traffic_score DESC
        LIMIT ${limit}
      `;

      return leaderboard.map((shop, index) => ({
        rank: index + 1,
        shopId: shop.id,
        name: shop.name,
        visits: parseInt(shop.visits || 0),
        trafficScore: parseFloat(shop.traffic_score || 0),
        engagementScore: parseFloat(shop.engagement_score || 0),
      }));
    } catch (error) {
      console.error("Error getting category leaderboard:", error);
      return [];
    }
  }
}

export default new TrafficAnalysis();
