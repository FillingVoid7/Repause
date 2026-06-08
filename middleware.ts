import { auth } from "./auth";

export default auth;

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/drill/:path*",
    "/articulation/:path*",
  ],
};
