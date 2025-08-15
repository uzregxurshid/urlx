import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema } from "@/lib/validators";

export async function POST(req) {
  try {
    const json = await req.json();
    const parsed = registerSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { name, surname, dob, country, email, password } = parsed.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        surname,
        dob: new Date(dob),            // expects YYYY-MM-DD from the form
        country,
        email,
        password: passwordHash,
      },
      select: { id: true, email: true },
    });

    // Auto sign-in
    await createSession(user);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
