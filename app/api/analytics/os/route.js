import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";

const COOKIE = "urlx_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

async function requireUserId() {
  const store = await cookies(); // Next 15
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
    if (!slug) return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });

    const link = await prisma.link.findFirst({ where: { slug, userId }, select: { id: true } });
    if (!link) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    const from = searchParams.get("from")
      ? new Date(searchParams.get("from"))
      : new Date(Date.now() - 29 * 86400000);

    const toParam = searchParams.get("to")
      ? new Date(searchParams.get("to"))
      : new Date();

    const toExclusive = new Date(toParam.getTime() + 86400000); // inclusive 'to' day
    const limit = Math.max(1, Math.min(30, Number(searchParams.get("limit") || "12")));

    const rows = await prisma.$queryRaw`
      SELECT COALESCE(NULLIF("os", ''), 'Unknown')::text AS os, COUNT(*)::int AS count
      FROM "Click"
      WHERE "linkId" = ${link.id}
        AND NOT "isBot"
        AND "ts" >= ${from} AND "ts" < ${toExclusive}
      GROUP BY 1
      ORDER BY count DESC
      LIMIT ${limit};
    `;

    return NextResponse.json({ ok: true, items: rows });
  } catch (e) {
    if (e?.message === "unauthorized")
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
