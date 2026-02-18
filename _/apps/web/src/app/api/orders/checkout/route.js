import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";
import Stripe from "stripe";
import { convertFromIRR } from "@/app/api/utils/currency";

export const POST = async (request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await auth();

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { products, shopId, redirectURL } = await request.json();

  if (!products || !shopId || !redirectURL) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Fetch shop and user data
    const [shop] = await sql`SELECT * FROM shops WHERE id = ${shopId}`;
    const [user] =
      await sql`SELECT currency FROM auth_users WHERE id = ${session.user.id}`;

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    const currency = user?.currency || "USD"; // Fallback to USD for Stripe

    // Calculate totals and commission
    let totalIRR = 0;
    const lineItems = products.map((p) => {
      const priceIRR = p.base_price_irr;
      totalIRR += priceIRR * p.quantity;

      const priceConverted = convertFromIRR(priceIRR, currency);

      return {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: { name: p.name },
          unit_amount: Math.round(priceConverted * 100), // Stripe expects cents
        },
        quantity: p.quantity,
      };
    });

    const commissionAmountIRR = (totalIRR * shop.commission_rate) / 100;

    // Create checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${redirectURL}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectURL}?canceled=true`,
      metadata: {
        userId: session.user.id,
        shopId: shopId,
        totalIRR: totalIRR.toString(),
        commissionAmountIRR: commissionAmountIRR.toString(),
        products: JSON.stringify(products),
        currency: currency,
      },
    });

    return Response.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};
