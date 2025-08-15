export const metadata = {
  title: "urlx — Shorten & Track",
  description: "Short links, QR codes, and analytics.",
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
