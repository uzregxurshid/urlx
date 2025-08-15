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
    if (!slug) return NextResponse.json({ ok: false, error: "Missing slug" }, { status: 400 });

    const link = await prisma.link.findFirst({ where: { slug, userId }, select: { id: true } });
    if (!link) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    // ⬇️ NEW: date range support (defaults last 30d) with inclusive 'to'
    const from = searchParams.get("from")
      ? new Date(searchParams.get("from"))
      : new Date(Date.now() - 29 * 86400000);
    const toParam = searchParams.get("to")
      ? new Date(searchParams.get("to"))
      : new Date();
    const toExclusive = new Date(toParam.getTime() + 86400000); // include all of 'to' day

    const [totals, devices] = await Promise.all([
      prisma.$queryRaw`
        SELECT 
          COUNT(*) FILTER (WHERE NOT "isBot")::int AS clicks,
          COUNT(DISTINCT CASE WHEN NOT "isBot" THEN "ipHash" END)::int AS uniques
        FROM "Click"
        WHERE "linkId" = ${link.id}
          AND "ts" >= ${from} AND "ts" < ${toExclusive};
      `,
      prisma.$queryRaw`
        SELECT COALESCE("device",'OTHER')::text AS device, COUNT(*)::int AS count
        FROM "Click"
        WHERE "linkId" = ${link.id} AND NOT "isBot"
          AND "ts" >= ${from} AND "ts" < ${toExclusive}
        GROUP BY COALESCE("device",'OTHER')
        ORDER BY count DESC;
      `
    ]);

    const { clicks = 0, uniques = 0 } = (totals?.[0] || {});
    return NextResponse.json({ ok: true, totals: { clicks, uniques }, devices });
  } catch (e) {
    if (e?.message === "unauthorized") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
