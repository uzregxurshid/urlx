"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon, LinkIcon, QrCodeIcon, ChartBarIcon, Cog6ToothIcon, Squares2X2Icon
} from "@heroicons/react/24/outline";

export const navItems = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/dashboard/links", label: "Links", Icon: LinkIcon },
  { href: "/dashboard/qr", label: "QR", Icon: QrCodeIcon },
  { href: "/dashboard/analytics", label: "Analytics", Icon: ChartBarIcon },
  { href: "/dashboard/settings", label: "Settings", Icon: Cog6ToothIcon },
  { href: "/dashboard/pages", label: "Pages", Icon: Squares2X2Icon },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {navItems.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors w-full ${
              active
                ? "bg-orange-600 text-white border-orange-600"
                : "bg-white border-orange-100 text-orange-800 hover:bg-orange-50"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
