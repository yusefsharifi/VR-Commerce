import { getRecommendations } from "@/app/api/utils/aiService";
import { auth } from "@/auth";

/**
 * GET /api/ai/recommendations/:userId
 * Proxy endpoint to fetch AI recommendations
 */
export async function GET(request, { params }) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(params.userId);

    // Users can only get their own recommendations (or admins can get any)
    if (session.user.id !== userId && session.user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const limit = parseInt(new URL(request.url).searchParams.get("limit")) || 5;
    const recommendations = await getRecommendations(userId, limit);

    return Response.json({
      success: true,
      recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return Response.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 },
    );
  }
}
