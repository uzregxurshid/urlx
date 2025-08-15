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

    const from = searchParams.get("from")
      ? new Date(searchParams.get("from"))
      : new Date(Date.now() - 29 * 86400000);
    const toParam = searchParams.get("to")
      ? new Date(searchParams.get("to"))
      : new Date();
    const toExclusive = new Date(toParam.getTime() + 86400000); // include all of 'to' day

    const rows = await prisma.$queryRaw`
      WITH series AS (
        SELECT generate_series(${from}::timestamp::date, ${toParam}::timestamp::date, interval '1 day')::date AS d
      ),
      counts AS (
        SELECT date_trunc('day', "ts")::date AS d, COUNT(*)::int AS c
        FROM "Click"
        WHERE "linkId" = ${link.id}
          AND NOT "isBot"
          AND "ts" >= ${from} AND "ts" < ${toExclusive}
        GROUP BY 1
      )
      SELECT s.d AS date, COALESCE(c.c, 0)::int AS count
      FROM series s
      LEFT JOIN counts c ON c.d = s.d
      ORDER BY s.d ASC;
    `;

    return NextResponse.json({ ok: true, items: rows });
  } catch (e) {
    if (e?.message === "unauthorized") return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
