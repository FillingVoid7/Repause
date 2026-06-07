import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import authConfig from "@/auth.config";
import { getMongoClientPromise } from "@/lib/db";

if (!process.env.AUTH_SECRET) {
  throw new Error('Missing environment variable: "AUTH_SECRET"');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(getMongoClientPromise(), {
    databaseName: process.env.MONGODB_DB_NAME,
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        } else if (session.user.email) {
          const { resolveSessionUserId } = await import("@/lib/sessionUser");
          const id = await resolveSessionUserId(session);
          if (id) {
            session.user.id = id;
          }
        }
      }
      return session;
    },
  },
});
