import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import {UAParser} from "ua-parser-js";

function hashIp(ip) {
  try { return crypto.createHash("sha256").update(ip || "").digest("hex"); }
  catch { return "na"; }
}

function decideDevice({ isBot, type }) {
  if (isBot) return "BOT";
  if (type === "mobile") return "MOBILE";
  if (type === "tablet") return "TABLET";
  if (type === "desktop" || !type) return "DESKTOP";
  return "OTHER";
}

export async function GET(req, ctx) {
  const { slug } = await ctx.params; // Next 15: await params

  const link = await prisma.link.findUnique({ where: { slug } });
  if (!link || !link.isActive || (link.expiresAt && link.expiresAt < new Date())) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const ua = req.headers.get("user-agent") || "";
  const referer = req.headers.get("referer") || null;

  // best-effort IP & geo
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim()
           || req.headers.get("x-real-ip")
           || "";
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    null;
  const city =
    req.headers.get("x-vercel-ip-city") ||
    req.headers.get("x-vercel-ip-city-region") || // sometimes used
    null;

  // bot detection + UA parse
  const isBot = /bot|crawl|spider|slurp|facebookexternalhit|WhatsApp|Preview/i.test(ua);
  const parsed = new UAParser(ua);
  const deviceType = parsed.getDevice()?.type || "desktop";
  const device = decideDevice({ isBot, type: deviceType });
  const browser = parsed.getBrowser()?.name || null;
  const os = parsed.getOS()?.name || null;

  // log click + increment counter (fire-and-forget)
  prisma.$transaction([
    prisma.click.create({
      data: {
        linkId: link.id,
        ts: new Date(),
        ipHash: hashIp(ip),
        ua,
        isBot,
        referer,
        country,
        city,
        device,    // NEW
        browser,   // NEW
        os,        // NEW
      },
    }),
    prisma.link.update({
      where: { id: link.id },
      data: { clicksCount: { increment: 1 }, lastClickedAt: new Date() },
    }),
  ]).catch(() => { /* ignore logging failures */ });

  return NextResponse.redirect(link.longUrl, 302);
}
