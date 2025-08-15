import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { createJwt, setSessionCookieOnResponse } from "@/lib/auth";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });

    const token = await createJwt(user);
    const res = NextResponse.json({ ok: true });
    setSessionCookieOnResponse(res, token);     // <-- sets Set-Cookie header
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
