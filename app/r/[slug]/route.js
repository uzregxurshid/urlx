import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";

function hashIp(ip) {
  try {
    return crypto.createHash("sha256").update(ip || "").digest("hex");
  } catch {
    return "na";
  }
}

export async function GET(req, ctx) {
  // ⬅️ Next 15: await params before reading properties
  const { slug } = await ctx.params;

  const link = await prisma.link.findUnique({ where: { slug } });
  if (!link || !link.isActive || (link.expiresAt && link.expiresAt < new Date())) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // non-blocking click log
  const ua = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || null;
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();

  const isBot = /bot|crawl|spider|slurp|facebookexternalhit|WhatsApp|Preview/i.test(ua);

  prisma.$transaction([
    prisma.click.create({
      data: {
        linkId: link.id,
        ipHash: hashIp(ip),
        ua,
        referer,
        isBot,
        country: null,
        city: null,
      },
    }),
    prisma.link.update({
      where: { id: link.id },
      data: { clicksCount: { increment: 1 }, lastClickedAt: new Date() },
    }),
  ]).catch(() => { /* ignore logging errors */ });

  return NextResponse.redirect(link.longUrl, 302);
}
