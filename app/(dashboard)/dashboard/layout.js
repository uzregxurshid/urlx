export const metadata = { title: "Dashboard — urlx" };

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({ children }) {
  // 🔒 Guard
  const store = await cookies();
  const token = store.get("urlx_session")?.value;
  if (!token) redirect("/login");
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { algorithms: ["HS256"] });
  } catch {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
