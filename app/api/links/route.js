import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { jwtVerify } from "jose";
import { createLinkSchema } from "@/lib/validators";
import { generateSlug } from "@/lib/slug";

const COOKIE = "urlx_session";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// --- helpers ---
async function requireUserId() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) throw new Error("unauthorized");
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload.sub;
}

// --- POST /api/links: create a link ---
export async function POST(req) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = createLinkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { longUrl } = parsed.data;
    let { slug, expiresAt } = parsed.data;

    // generate slug if none
    if (!slug) slug = generateSlug();

    // try create, retry on collision (P2002)
    let link;
    for (let i = 0; i < 3; i++) {
      try {
        link = await prisma.link.create({
          data: {
            userId,
            slug,
            longUrl,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
          },
          select: { id: true, slug: true, longUrl: true, createdAt: true },
        });
        break;
      } catch (e) {
        // unique violation -> regenerate slug and retry
        if (e?.code === "P2002" || (e?.message || "").includes("Unique constraint")) {
          slug = generateSlug();
          continue;
        }
        throw e;
      }
    }
    if (!link) {
      return NextResponse.json({ ok: false, error: "Could not create link" }, { status: 500 });
    }

    const origin = req.nextUrl.origin || process.env.APP_BASE_URL || "http://localhost:3000";
    const shortUrl = `${origin}/r/${link.slug}`;

    return NextResponse.json({ ok: true, link, shortUrl });
  } catch (e) {
    if (e.message === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}

// --- GET /api/links: list current user's links (simple pagination) ---
export async function GET(req) {
  try {
    const userId = await requireUserId();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "10")));

    const [items, total] = await Promise.all([
      prisma.link.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, slug: true, longUrl: true, clicksCount: true, isActive: true, createdAt: true, expiresAt: true },
      }),
      prisma.link.count({ where: { userId } }),
    ]);

    const origin = req.nextUrl.origin || process.env.APP_BASE_URL || "http://localhost:3000";
    const withShort = items.map((it) => ({ ...it, shortUrl: `${origin}/r/${it.slug}` }));

    return NextResponse.json({ ok: true, items: withShort, total, page, pageSize });
  } catch (e) {
    if (e.message === "unauthorized") {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error(e);
    return NextResponse.json({ ok: false, error: "Something went wrong" }, { status: 500 });
  }
}
