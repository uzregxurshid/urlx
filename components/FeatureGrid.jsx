import { ChartBarIcon, QrCodeIcon, LinkIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const features = [
  {
    title: "Short links with custom slugs",
    desc: "Brand your links, set expirations, and manage them from your dashboard.",
    Icon: LinkIcon,
  },
  {
    title: "Beautiful QR codes",
    desc: "Customize styles, add logos, and download SVG/PNG for print or screens.",
    Icon: QrCodeIcon,
  },
  {
    title: "Analytics by country & referrer",
    desc: "See where clicks come from with time-series and country breakdowns.",
    Icon: ChartBarIcon,
  },
  {
    title: "Bot filtering & rate limits",
    desc: "Keep metrics clean with UA heuristics and per-link throttling.",
    Icon: ShieldCheckIcon,
  },
];

export default function FeatureGrid() {
  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, desc, Icon }) => (
            <div
              key={title}
              className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm hover:shadow transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-orange-50 text-orange-700 grid place-items-center mb-3">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-orange-800">{title}</h3>
              <p className="text-sm text-orange-900/70 mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
