import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  const category = searchParams.get("category");
  const ownerId = searchParams.get("ownerId");

  let query = "SELECT * FROM shops WHERE 1=1";
  const params = [];

  if (country) {
    params.push(country);
    query += ` AND country = $${params.length}`;
  }
  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }
  if (ownerId) {
    params.push(ownerId);
    query += ` AND owner_id = $${params.length}`;
  }

  try {
    const shops = await sql(query, params);
    return Response.json(shops);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, country, category, premium_level, decoration } = body;

  if (!name || !country || !category) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const [shop] = await sql`
      INSERT INTO shops (owner_id, name, country, category, premium_level, decoration)
      VALUES (${session.user.id}, ${name}, ${country}, ${category}, ${premium_level || 0}, ${decoration || {}})
      RETURNING *
    `;
    return Response.json(shop);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to create shop" }, { status: 500 });
  }
}
