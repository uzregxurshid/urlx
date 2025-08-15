import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { changeEmailSchema } from "@/lib/validators";

const COOKIE = "urlx_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function requireUserId() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) throw new Error("unauthorized");
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload.sub;
}

export async function PATCH(req) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = changeEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const { email, currentPassword } = parsed.data;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { email },
      select: { id: true, email: true, country: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (e) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Email is already in use" }, { status: 409 });
    }
    if (e?.message === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
