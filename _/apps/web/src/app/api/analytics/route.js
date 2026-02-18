import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import { pushEventToAIQueue } from "@/app/api/utils/aiService";

export async function POST(request) {
  const session = await auth();
  const body = await request.json();
  const { event_type, shop_id, product_id } = body;

  if (!event_type) {
    return Response.json({ error: "Event type is required" }, { status: 400 });
  }

  try {
    await sql`
      INSERT INTO analytics_events (user_id, event_type, shop_id, product_id)
      VALUES (${session?.user?.id || null}, ${event_type}, ${shop_id}, ${product_id})
    `;

    // Increment shop visits if it's a visit event
    if (event_type === "shop_visit" && shop_id) {
      await sql`UPDATE shops SET analytics_visits = analytics_visits + 1 WHERE id = ${shop_id}`;
    }

    // Push event to AI service queue for processing
    await pushEventToAIQueue({
      user_id: session?.user?.id || null,
      event_type,
      shop_id,
      product_id,
      timestamp: new Date(),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to record event" }, { status: 500 });
  }
}
