import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const protectedPaths = ["/dashboard", "/drill", "/articulation"];
      const isProtected = protectedPaths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      if (isProtected) {
        return isLoggedIn;
      }

      return true;
    },
    session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  trustHost: true,
} satisfies NextAuthConfig;
