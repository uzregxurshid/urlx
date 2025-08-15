import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

const COOKIE = "urlx_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// auth helper
async function requireUserId() {
  const store = await cookies(); // Next 15
  const token = store.get(COOKIE)?.value;
  if (!token) throw new Error("unauthorized");
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload.sub;
}

// ✅ PATCH /api/links/:id  -> toggle or set isActive
export async function PATCH(req, ctx) {
  try {
    const { id } = await ctx.params;       // Next 15: await params
    const userId = await requireUserId();

    // ensure link belongs to user
    const current = await prisma.link.findFirst({
      where: { id, userId },
      select: { id: true, isActive: true, slug: true, longUrl: true, createdAt: true, expiresAt: true, clicksCount: true },
    });
    if (!current) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    // body can explicitly set { isActive }, otherwise we toggle
    let desired;
    try {
      const body = await req.json();
      if (typeof body?.isActive === "boolean") desired = body.isActive;
    } catch { /* no body -> toggle */ }
    if (typeof desired !== "boolean") desired = !current.isActive;

    const updated = await prisma.link.update({
      where: { id },
      data: { isActive: desired },
      select: { id: true, isActive: true, slug: true, longUrl: true, createdAt: true, expiresAt: true, clicksCount: true },
    });

    return NextResponse.json({ ok: true, link: updated });
  } catch (e) {
    if (e?.message === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
// DELETE /api/links/:id
export async function DELETE(req, ctx) {
  try {
    const { id } = await ctx.params; // Next 15: await params
    const userId = await requireUserId();

    // make sure the link belongs to this user
    const link = await prisma.link.findFirst({ where: { id, userId }, select: { id: true } });
    if (!link) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    // remove clicks then link (safe if FK is RESTRICT)
    await prisma.$transaction([
      prisma.click.deleteMany({ where: { linkId: id } }),
      prisma.link.delete({ where: { id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e?.message === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
