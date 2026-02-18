import { getShopScore } from "@/app/api/utils/aiService";

/**
 * GET /api/ai/shop-score/:shopId
 * Proxy endpoint to fetch shop performance score
 * Public endpoint - anyone can view shop scores
 */
export async function GET(request, { params }) {
  try {
    const shopId = parseInt(params.shopId);

    const score = await getShopScore(shopId);

    if (!score) {
      return Response.json(
        { error: "Shop score not available yet" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      score,
    });
  } catch (error) {
    console.error("Error fetching shop score:", error);
    return Response.json(
      { error: "Failed to fetch shop score" },
      { status: 500 },
    );
  }
}
