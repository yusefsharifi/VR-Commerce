import { getVendorInsights } from "@/app/api/utils/aiService";
import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

/**
 * GET /api/ai/vendor-insights/:shopId
 * Proxy endpoint to fetch vendor insights
 */
export async function GET(request, { params }) {
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const shopId = parseInt(params.shopId);

    // Verify user owns this shop or is admin
    const shop = await sql`
      SELECT owner_id FROM shops WHERE id = ${shopId}
    `;

    if (shop.length === 0) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop[0].owner_id !== session.user.id && session.user.role !== "admin") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const insights = await getVendorInsights(shopId);

    return Response.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("Error fetching vendor insights:", error);
    return Response.json(
      { error: "Failed to fetch insights" },
      { status: 500 },
    );
  }
}
