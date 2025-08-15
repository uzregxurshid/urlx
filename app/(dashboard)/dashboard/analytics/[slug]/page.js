export const metadata = { title: "Analytics — urlx" };

import AnalyticsClient from "@/components/dashboard/analytics/AnalyticsClient";

export default async function Page(props) {
  const { slug } = await props.params; // Next 15: await params
  return <AnalyticsClient slug={slug} />;
}
