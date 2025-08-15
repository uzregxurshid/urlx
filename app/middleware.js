import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "urlx_session";

export async function middleware(req) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL("/login", req.url));
    try { await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)); }
    catch { return NextResponse.redirect(new URL("/login", req.url)); }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
