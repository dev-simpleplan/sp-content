import StaticMessagePage from "../components/StaticMessagePage";

export const metadata = {
  title: "Thank You — SimplePlan Media",
};

export default function ThankYouPage() {
  return (
    <StaticMessagePage
      heading="Thank You"
      quote="“We’ve Received Your Request.”"
      subtext="Our team will review your request and get back to you within 1–2 business days."
    />
  );
}
