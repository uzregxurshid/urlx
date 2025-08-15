import { SignJWT, jwtVerify } from "jose";
export const SESSION_COOKIE = "urlx_session";

const alg = "HS256";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createJwt(user) {
  return await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export function setSessionCookieOnResponse(res, token) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret, { algorithms: [alg] });
  return payload; // { sub, email, iat, exp }
}
