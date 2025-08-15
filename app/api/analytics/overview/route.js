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

    const from = searchParams.get("from")
      ? new Date(searchParams.get("from"))
      : new Date(Date.now() - 29 * 86400000);
    const toParam = searchParams.get("to")
      ? new Date(searchParams.get("to"))
      : new Date();
    const toExclusive = new Date(toParam.getTime() + 86400000); // include all of 'to' day

    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || "12")));

    const [totals, countries] = await Promise.all([
      prisma.$queryRaw`
        WITH filtered AS (
          SELECT c.*
          FROM "Click" c
          JOIN "Link" l ON l."id" = c."linkId"
          WHERE l."userId" = ${userId}
            AND c."ts" >= ${from} AND c."ts" < ${toExclusive}
        )
        SELECT 
          COUNT(*) FILTER (WHERE NOT "isBot")::int AS clicks,
          COUNT(DISTINCT CASE WHEN NOT "isBot" THEN "ipHash" END)::int AS uniques
        FROM filtered;
      `,
      prisma.$queryRaw`
        WITH filtered AS (
          SELECT c.*
          FROM "Click" c
          JOIN "Link" l ON l."id" = c."linkId"
          WHERE l."userId" = ${userId}
            AND c."ts" >= ${from} AND c."ts" < ${toExclusive}
            AND NOT c."isBot"
        )
        SELECT COALESCE(NULLIF("country", ''), 'Unknown')::text AS country, COUNT(*)::int AS count
        FROM filtered
        GROUP BY 1
        ORDER BY count DESC
        LIMIT ${limit};
      `,
    ]);

    const { clicks = 0, uniques = 0 } = (totals?.[0] || {});
    const topCountry = countries?.[0]?.country || "—";

    return NextResponse.json({
      ok: true,
      totals: { clicks, uniques },
      countries,
      topCountry,
      from,
      to: toParam,
    });
  } catch (e) {
    if (e?.message === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
