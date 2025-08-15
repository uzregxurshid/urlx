import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const COOKIE = "urlx_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET() {
  const store = await cookies();                   // Next 15: await
  const token = store.get(COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.json(
      { authenticated: true, user: { id: payload.sub, email: payload.email } },
      { status: 200 },
    );
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
