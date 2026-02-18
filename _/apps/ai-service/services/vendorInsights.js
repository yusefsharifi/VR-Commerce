import sql from "../db/connection.js";

/**
 * VENDOR INSIGHT ENGINE
 * Provides actionable insights for shop owners
 * - Conversion metrics
 * - Product performance analysis
 * - Price optimization suggestions
 * - Promotion recommendations
 */

class VendorInsights {
  /**
   * Get comprehensive insights for a shop
   * @param {number} shopId - Shop ID
   */
  async getShopInsights(shopId) {
    try {
      const [
        conversionMetrics,
        productPerformance,
        priceAnalysis,
        promotionSuggestions,
      ] = await Promise.all([
        this.getConversionMetrics(shopId),
        this.getProductPerformance(shopId),
        this.analyzePricing(shopId),
        this.generatePromotionSuggestions(shopId),
      ]);

      return {
        shopId,
        conversion: conversionMetrics,
        products: productPerformance,
        pricing: priceAnalysis,
        promotions: promotionSuggestions,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error generating shop insights:", error);
      throw error;
    }
  }

  /**
   * Calculate conversion rate and related metrics
   */
  async getConversionMetrics(shopId) {
    try {
      // Get event counts for the shop
      const metrics = await sql`
        SELECT
          COUNT(CASE WHEN event_type = 'shop_visit' THEN 1 END) as visits,
          COUNT(CASE WHEN event_type = 'productView' THEN 1 END) as product_views,
          COUNT(CASE WHEN event_type = 'addToCart' THEN 1 END) as cart_adds,
          COUNT(DISTINCT user_id) as unique_visitors
        FROM analytics_events
        WHERE shop_id = ${shopId}
          AND timestamp > NOW() - INTERVAL '30 days'
      `;

      // Get purchase count from orders
      const purchases = await sql`
        SELECT COUNT(*) as purchase_count
        FROM orders
        WHERE shop_id = ${shopId}
          AND status = 'completed'
          AND created_at > NOW() - INTERVAL '30 days'
      `;

      const visits = parseInt(metrics[0].visits) || 0;
      const productViews = parseInt(metrics[0].product_views) || 0;
      const cartAdds = parseInt(metrics[0].cart_adds) || 0;
      const purchaseCount = parseInt(purchases[0].purchase_count) || 0;
      const uniqueVisitors = parseInt(metrics[0].unique_visitors) || 0;

      // Calculate conversion funnel
      const viewToCartRate = productViews > 0 ? cartAdds / productViews : 0;
      const cartToPurchaseRate = cartAdds > 0 ? purchaseCount / cartAdds : 0;
      const overallConversionRate = visits > 0 ? purchaseCount / visits : 0;

      return {
        visits,
        uniqueVisitors,
        productViews,
        cartAdds,
        purchases: purchaseCount,
        conversionRate: parseFloat((overallConversionRate * 100).toFixed(2)),
        viewToCartRate: parseFloat((viewToCartRate * 100).toFixed(2)),
        cartToPurchaseRate: parseFloat((cartToPurchaseRate * 100).toFixed(2)),
        period: "30 days",
      };
    } catch (error) {
      console.error("Error calculating conversion metrics:", error);
      return null;
    }
  }

  /**
   * Analyze individual product performance
   * Identify high-view/low-purchase products
   */
  async getProductPerformance(shopId) {
    try {
      const products = await sql`
        SELECT
          p.id,
          p.name,
          p.base_price_irr,
          p.stock,
          COUNT(CASE WHEN ae.event_type = 'productView' THEN 1 END) as views,
          COUNT(CASE WHEN ae.event_type = 'addToCart' THEN 1 END) as cart_adds
        FROM products p
        LEFT JOIN analytics_events ae ON p.id = ae.product_id
        WHERE p.shop_id = ${shopId}
          AND (ae.timestamp > NOW() - INTERVAL '30 days' OR ae.timestamp IS NULL)
        GROUP BY p.id
        ORDER BY views DESC
      `;

      // Categorize products
      const analysis = products.map((product) => {
        const views = parseInt(product.views) || 0;
        const cartAdds = parseInt(product.cart_adds) || 0;
        const conversionRate = views > 0 ? cartAdds / views : 0;

        let category = "new";
        let recommendation = "Monitor performance";

        if (views > 50) {
          if (conversionRate < 0.05) {
            category = "high_view_low_conversion";
            recommendation =
              "Consider price adjustment or better product images";
          } else if (conversionRate > 0.2) {
            category = "high_performer";
            recommendation = "Increase stock and promote more";
          } else {
            category = "moderate_performer";
            recommendation = "Optimize product description";
          }
        } else if (views < 10 && product.stock > 0) {
          category = "low_visibility";
          recommendation = "Improve SEO and product positioning";
        }

        return {
          productId: product.id,
          name: product.name,
          price: product.base_price_irr,
          stock: product.stock,
          views,
          cartAdds,
          conversionRate: parseFloat((conversionRate * 100).toFixed(2)),
          category,
          recommendation,
        };
      });

      return {
        totalProducts: products.length,
        highPerformers: analysis.filter((p) => p.category === "high_performer"),
        needsAttention: analysis.filter(
          (p) => p.category === "high_view_low_conversion",
        ),
        lowVisibility: analysis.filter((p) => p.category === "low_visibility"),
        all: analysis,
      };
    } catch (error) {
      console.error("Error analyzing product performance:", error);
      return null;
    }
  }

  /**
   * Analyze pricing strategy
   */
  async analyzePricing(shopId) {
    try {
      // Get shop's products
      const shopProducts = await sql`
        SELECT base_price_irr
        FROM products
        WHERE shop_id = ${shopId}
      `;

      if (shopProducts.length === 0) {
        return null;
      }

      // Get shop category
      const shop = await sql`
        SELECT category FROM shops WHERE id = ${shopId}
      `;

      const category = shop[0]?.category;

      // Get competitor pricing in same category
      const competitorPrices = await sql`
        SELECT AVG(p.base_price_irr) as avg_price, MIN(p.base_price_irr) as min_price, MAX(p.base_price_irr) as max_price
        FROM products p
        JOIN shops s ON p.shop_id = s.id
        WHERE s.category = ${category}
          AND s.id != ${shopId}
      `;

      const shopAvgPrice =
        shopProducts.reduce((sum, p) => sum + parseFloat(p.base_price_irr), 0) /
        shopProducts.length;
      const competitorAvg = parseFloat(competitorPrices[0]?.avg_price || 0);

      let positioning = "average";
      let suggestion = "Your pricing is competitive";

      if (shopAvgPrice > competitorAvg * 1.2) {
        positioning = "premium";
        suggestion =
          "Your prices are above market average. Ensure quality and branding justify premium pricing.";
      } else if (shopAvgPrice < competitorAvg * 0.8) {
        positioning = "budget";
        suggestion =
          "Your prices are below market average. Consider slight increase to improve margins.";
      }

      return {
        shopAveragePrice: parseFloat(shopAvgPrice.toFixed(2)),
        categoryAveragePrice: parseFloat(competitorAvg.toFixed(2)),
        positioning,
        suggestion,
        priceRange: {
          min: parseFloat(competitorPrices[0]?.min_price || 0),
          max: parseFloat(competitorPrices[0]?.max_price || 0),
        },
      };
    } catch (error) {
      console.error("Error analyzing pricing:", error);
      return null;
    }
  }

  /**
   * Generate promotion suggestions
   */
  async generatePromotionSuggestions(shopId) {
    try {
      const suggestions = [];

      // Analyze traffic patterns
      const trafficByDay = await sql`
        SELECT
          EXTRACT(DOW FROM timestamp) as day_of_week,
          COUNT(*) as visit_count
        FROM analytics_events
        WHERE shop_id = ${shopId}
          AND event_type = 'shop_visit'
          AND timestamp > NOW() - INTERVAL '30 days'
        GROUP BY day_of_week
        ORDER BY visit_count ASC
      `;

      if (trafficByDay.length > 0) {
        const slowestDay = trafficByDay[0];
        const dayNames = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        suggestions.push({
          type: "time_based",
          priority: "medium",
          title: "Boost Slow Days",
          description: `${dayNames[slowestDay.day_of_week]} has the lowest traffic. Consider running flash sales on this day.`,
          expectedImpact: "15-25% traffic increase",
        });
      }

      // Analyze abandoned carts
      const cartAbandonmentRate = await sql`
        SELECT
          COUNT(CASE WHEN event_type = 'addToCart' THEN 1 END) as carts,
          (SELECT COUNT(*) FROM orders WHERE shop_id = ${shopId} AND created_at > NOW() - INTERVAL '30 days') as purchases
        FROM analytics_events
        WHERE shop_id = ${shopId}
          AND timestamp > NOW() - INTERVAL '30 days'
      `;

      const carts = parseInt(cartAbandonmentRate[0]?.carts || 0);
      const purchases = parseInt(cartAbandonmentRate[0]?.purchases || 0);

      if (carts > 0 && purchases / carts < 0.3) {
        suggestions.push({
          type: "cart_recovery",
          priority: "high",
          title: "Reduce Cart Abandonment",
          description:
            "High cart abandonment detected. Offer free shipping or small discount for completing purchase.",
          expectedImpact: "10-20% conversion increase",
        });
      }

      // Seasonal recommendation
      const currentMonth = new Date().getMonth();
      const seasonalMonths = [11, 0, 1]; // Nov, Dec, Jan - Holiday season

      if (seasonalMonths.includes(currentMonth)) {
        suggestions.push({
          type: "seasonal",
          priority: "high",
          title: "Holiday Season Promotion",
          description:
            "Run holiday-themed promotions and gift bundles to capitalize on seasonal shopping.",
          expectedImpact: "30-50% sales increase",
        });
      }

      return suggestions;
    } catch (error) {
      console.error("Error generating promotion suggestions:", error);
      return [];
    }
  }
}

export default new VendorInsights();
