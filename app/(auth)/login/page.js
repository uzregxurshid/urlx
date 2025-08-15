export const metadata = { title: "Login — urlx" };

import LoginClient from "@/components/auth/LoginClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";

export default async function Page() {
  const store = await cookies();
  const token = store.get("urlx_session")?.value;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET), { algorithms: ["HS256"] });
      redirect("/dashboard");
    } catch {}
  }
  return <LoginClient />;
}
