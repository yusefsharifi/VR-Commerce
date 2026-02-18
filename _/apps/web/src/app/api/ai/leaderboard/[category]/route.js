import { getCategoryLeaderboard } from "@/app/api/utils/aiService";

/**
 * GET /api/ai/leaderboard/:category
 * Proxy endpoint to fetch category leaderboard
 * Public endpoint - anyone can view leaderboards
 */
export async function GET(request, { params }) {
  try {
    const category = params.category;
    const limit =
      parseInt(new URL(request.url).searchParams.get("limit")) || 10;

    const leaderboard = await getCategoryLeaderboard(category, limit);

    return Response.json({
      success: true,
      category,
      leaderboard,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return Response.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
