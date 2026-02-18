import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const shopId = searchParams.get("shopId");
  const category = searchParams.get("category");

  let query = "SELECT * FROM products WHERE 1=1";
  const params = [];

  if (shopId) {
    params.push(shopId);
    query += ` AND shop_id = $${params.length}`;
  }
  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  try {
    const products = await sql(query, params);
    return Response.json(products);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { shop_id, name, base_price_irr, images, category, stock } = body;

  // Verify ownership
  const [shop] = await sql`SELECT owner_id FROM shops WHERE id = ${shop_id}`;
  if (!shop || shop.owner_id !== session.user.id) {
    return Response.json(
      { error: "Unauthorized to add products to this shop" },
      { status: 403 },
    );
  }

  try {
    const [product] = await sql`
      INSERT INTO products (shop_id, name, base_price_irr, images, category, stock)
      VALUES (${shop_id}, ${name}, ${base_price_irr}, ${images || []}, ${category}, ${stock || 0})
      RETURNING *
    `;
    return Response.json(product);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
