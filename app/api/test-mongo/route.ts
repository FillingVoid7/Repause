import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI!);

    await client.connect();
    await client.db().admin().ping();

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json(e, { status: 500 });
  }
}