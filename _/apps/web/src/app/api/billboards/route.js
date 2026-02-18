import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const billboards = await sql`SELECT * FROM billboards`;
    return Response.json(billboards);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to fetch billboards" },
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
  const { billboard_id, start_date, end_date } = body;

  try {
    const [billboard] = await sql`
      UPDATE billboards 
      SET rented_by = ${session.user.id}, 
          start_date = ${start_date}, 
          end_date = ${end_date}
      WHERE id = ${billboard_id} AND rented_by IS NULL
      RETURNING *
    `;

    if (!billboard) {
      return Response.json(
        { error: "Billboard already rented or not found" },
        { status: 400 },
      );
    }

    return Response.json(billboard);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to reserve billboard" },
      { status: 500 },
    );
  }
}
