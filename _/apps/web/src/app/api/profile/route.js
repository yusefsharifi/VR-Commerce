import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [user] =
      await sql`SELECT id, name, email, role, country, currency FROM auth_users WHERE id = ${session.user.id}`;
    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { role, country, currency } = body;

  try {
    const [user] = await sql`
      UPDATE auth_users 
      SET role = COALESCE(${role}, role), 
          country = COALESCE(${country}, country), 
          currency = COALESCE(${currency}, currency)
      WHERE id = ${session.user.id}
      RETURNING id, name, email, role, country, currency
    `;
    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
