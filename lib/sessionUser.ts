import type { Session } from "next-auth";

import { getMongoClientPromise } from "@/lib/db";

/**
 * Resolves the MongoDB user id for the current session.
 * Falls back to email lookup when JWT sub is missing (legacy sessions).
 */
export async function resolveSessionUserId(
  session: Session | null,
): Promise<string | null> {
  if (!session?.user) {
    return null;
  }

  if (session.user.id) {
    return session.user.id;
  }

  const email = session.user.email;
  if (!email) {
    return null;
  }

  try {
    const client = await getMongoClientPromise();
    const dbName = process.env.MONGODB_DB_NAME;
    const db = dbName ? client.db(dbName) : client.db();

    const user = await db.collection("users").findOne({ email });
    return user?._id?.toString() ?? null;
  } catch {
    return null;
  }
}
