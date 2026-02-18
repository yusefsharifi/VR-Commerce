import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";

export const POST = async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await request.json();

  if (!sessionId) {
    return Response.json({ error: "Session ID is required" }, { status: 400 });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== "paid") {
      return Response.json({
        status: "pending",
        message: "Payment not yet confirmed",
      });
    }

    // Check if order already exists to prevent duplicates
    const [existingOrder] =
      await sql`SELECT id FROM orders WHERE stripe_payment_id = ${sessionId}`;
    if (existingOrder) {
      return Response.json({ status: "success", orderId: existingOrder.id });
    }

    const {
      userId,
      shopId,
      totalIRR,
      commissionAmountIRR,
      products,
      currency,
    } = stripeSession.metadata;

    // Create the order
    const [order] = await sql`
      INSERT INTO orders (user_id, shop_id, products, total_amount, currency, commission_amount, stripe_payment_id, status)
      VALUES (${userId}, ${shopId}, ${products}, ${totalIRR}, ${currency}, ${commissionAmountIRR}, ${sessionId}, 'completed')
      RETURNING *
    `;

    return Response.json({ status: "success", orderId: order.id });
  } catch (error) {
    console.error("Order Confirmation Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
