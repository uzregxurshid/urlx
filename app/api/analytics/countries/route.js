import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

const COOKIE = "urlx_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function requireUserId() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) throw new Error("unauthorized");
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload.sub;
}

export async function GET(req) {
  try {
    const userId = await requireUserId();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || "12")));
    if (!slug) return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });

    const link = await prisma.link.findFirst({ where: { slug, userId }, select: { id: true } });
    if (!link) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    const rows = await prisma.$queryRaw`
      SELECT COALESCE(NULLIF("country", ''), 'Unknown')::text AS country, COUNT(*)::int AS count
      FROM "Click"
      WHERE "linkId" = ${link.id} AND NOT "isBot"
      GROUP BY 1
      ORDER BY count DESC
      LIMIT ${limit};
    `;

    return NextResponse.json({ ok: true, items: rows });
  } catch (e) {
    if (e?.message === "unauthorized") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
