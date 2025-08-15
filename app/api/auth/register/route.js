export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import bcrypt from "bcryptjs";
import { createJwt, setSessionCookieOnResponse } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, surname, dob, country, email, password } = parsed.data;

    // check existing
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Email is already registered" },
        { status: 409 }
      );
    }

    // hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name,
        surname,
        dob: new Date(dob),
        country,
      },
      select: { id: true, email: true },
    });

    // issue JWT & set cookie on the response
    const token = await createJwt(user);
    const res = NextResponse.json({ ok: true, user });
    setSessionCookieOnResponse(res, token);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}
