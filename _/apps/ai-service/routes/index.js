import { Router } from "express";
import { validateApiKey } from "../middleware/auth.js";
import { validateUserId, validateShopId } from "../middleware/validation.js";
import {
  recommendationLimiter,
  computeLimiter,
} from "../middleware/rateLimit.js";
import recommendationEngine from "../services/recommendationEngine.js";
import vendorInsights from "../services/vendorInsights.js";
import trafficAnalysis from "../services/trafficAnalysis.js";
import behaviorEngine from "../services/behaviorEngine.js";

const router = Router();

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "ai-service",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ai/recommendations/:userId
 * Get personalized product recommendations for a user
 */
router.get(
  "/ai/recommendations/:userId",
  validateApiKey,
  validateUserId,
  recommendationLimiter,
  async (req, res) => {
    try {
      const userId = req.validatedUserId;
      const limit = parseInt(req.query.limit) || 5;

      const recommendations = await recommendationEngine.getRecommendations(
        userId,
        limit,
      );

      res.json({
        success: true,
        userId,
        recommendations,
        count: recommendations.length,
      });
    } catch (error) {
      console.error("Error in recommendations endpoint:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to generate recommendations",
      });
    }
  },
);

/**
 * GET /ai/vendor-insights/:shopId
 * Get comprehensive insights for a shop
 */
router.get(
  "/ai/vendor-insights/:shopId",
  validateApiKey,
  validateShopId,
  computeLimiter,
  async (req, res) => {
    try {
      const shopId = req.validatedShopId;

      const insights = await vendorInsights.getShopInsights(shopId);

      res.json({
        success: true,
        insights,
      });
    } catch (error) {
      console.error("Error in vendor insights endpoint:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to generate insights",
      });
    }
  },
);

/**
 * GET /ai/shop-score/:shopId
 * Get traffic and engagement scores for a shop
 */
router.get(
  "/ai/shop-score/:shopId",
  validateApiKey,
  validateShopId,
  computeLimiter,
  async (req, res) => {
    try {
      const shopId = req.validatedShopId;

      const score = await trafficAnalysis.calculateShopScore(shopId);

      res.json({
        success: true,
        score,
      });
    } catch (error) {
      console.error("Error in shop score endpoint:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to calculate shop score",
      });
    }
  },
);

/**
 * GET /ai/user-profile/:userId
 * Get user AI profile
 */
router.get(
  "/ai/user-profile/:userId",
  validateApiKey,
  validateUserId,
  async (req, res) => {
    try {
      const userId = req.validatedUserId;

      const profile = await behaviorEngine.getUserProfile(userId);

      if (!profile) {
        return res.status(404).json({
          error: "Not found",
          message: "User AI profile not found",
        });
      }

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Error in user profile endpoint:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to get user profile",
      });
    }
  },
);

/**
 * POST /ai/process-user/:userId
 * Manually trigger user behavior processing
 */
router.post(
  "/ai/process-user/:userId",
  validateApiKey,
  validateUserId,
  async (req, res) => {
    try {
      const userId = req.validatedUserId;

      const profile = await behaviorEngine.processUserBehavior(userId);

      res.json({
        success: true,
        profile,
      });
    } catch (error) {
      console.error("Error in process user endpoint:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to process user behavior",
      });
    }
  },
);

/**
 * GET /ai/category-leaderboard/:category
 * Get shop leaderboard for a category
 */
router.get(
  "/ai/category-leaderboard/:category",
  validateApiKey,
  async (req, res) => {
    try {
      const category = req.params.category;
      const limit = parseInt(req.query.limit) || 10;

      const leaderboard = await trafficAnalysis.getCategoryLeaderboard(
        category,
        limit,
      );

      res.json({
        success: true,
        category,
        leaderboard,
      });
    } catch (error) {
      console.error("Error in leaderboard endpoint:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to get leaderboard",
      });
    }
  },
);

export default router;
