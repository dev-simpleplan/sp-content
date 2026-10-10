import StaticMessagePage from "./components/StaticMessagePage";

export const metadata = {
  title: "Page Not Found — SimplePlan Media",
};

// Next.js's special file: automatically rendered for any unmatched route,
// and for any explicit notFound() call elsewhere in the app (e.g. the
// service/[slug] and blogs/[slug] pages).
export default function NotFound() {
  return (
    <StaticMessagePage
      heading="404"
      large
      quote="Looks like this page has moved."
      subtext="The link may be outdated, or the page might have been moved."
    />
  );
}
